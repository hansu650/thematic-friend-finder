from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from .models import Block, Decision, Match, Profile

class ContactUnavailable(ValueError):
    pass

def pair_query(a, b):
    low, high = sorted((a.pk, b.pk))
    return {"user_low_id": low, "user_high_id": high}

def is_blocked(a, b):
    return Block.objects.filter(Q(blocker=a, blocked=b) | Q(blocker=b, blocked=a)).exists()

def matches_for(user):
    return Match.objects.filter(Q(user_low=user) | Q(user_high=user), active=True).select_related("user_low__profile", "user_high__profile")

def recommendations(user, interest="", goal=""):
    excluded = {user.pk}
    excluded.update(Decision.objects.filter(sender=user).values_list("receiver_id", flat=True))
    excluded.update(Block.objects.filter(blocker=user).values_list("blocked_id", flat=True))
    excluded.update(Block.objects.filter(blocked=user).values_list("blocker_id", flat=True))
    for match in Match.objects.filter(Q(user_low=user) | Q(user_high=user)):
        excluded.add(match.user_high_id if match.user_low_id == user.pk else match.user_low_id)
    profiles = Profile.objects.filter(discoverable=True, adult_confirmed=True, user__is_active=True).exclude(user_id__in=excluded).exclude(bio="").prefetch_related("interests")
    if interest:
        profiles = profiles.filter(interests__slug=interest)
    if goal:
        profiles = profiles.filter(goal=goal)
    own = set(user.profile.interests.values_list("id", flat=True))
    ranked = []
    for profile in profiles.distinct():
        theirs = list(profile.interests.all())
        if not theirs:
            continue
        shared = [item for item in theirs if item.pk in own]
        union = own | {item.pk for item in theirs}
        score = 80 * len(shared) / max(len(union), 1) + (20 if user.profile.goal == profile.goal else 0)
        ranked.append({"profile": profile, "shared": shared, "interests": theirs, "score": score})
    ranked.sort(key=lambda row: (-row["score"], row["profile"].pk))
    return ranked

@transaction.atomic
def decide(user, target, kind):
    if kind not in ("like", "skip", "star") or user.pk == target.pk:
        raise ContactUnavailable("这个操作不可用。")
    # PostgreSQL deployments use a stable lock order; SQLite relies on its write lock.
    list(get_user_model().objects.select_for_update().filter(pk__in=[user.pk, target.pk]).order_by("pk"))
    if not hasattr(user, "profile") or not hasattr(target, "profile") or not user.profile.ready or not target.profile.ready or not target.profile.discoverable or not target.is_active or is_blocked(user, target):
        raise ContactUnavailable("这份资料暂时不可见，请查看其他朋友。")
    existing_match = Match.objects.filter(**pair_query(user, target)).first()
    if existing_match and not existing_match.active:
        raise ContactUnavailable("这段联系已经结束。")
    if existing_match:
        return existing_match
    Decision.objects.update_or_create(sender=user, receiver=target, defaults={"kind": kind, "created_at": timezone.now()})
    if kind in ("like", "star") and Decision.objects.filter(sender=target, receiver=user, kind__in=("like", "star")).exists():
        match, _ = Match.objects.get_or_create(**pair_query(user, target))
        return match
    return None

@transaction.atomic
def block_user(user, target):
    if user.pk == target.pk:
        raise ContactUnavailable("不能屏蔽自己。")
    list(get_user_model().objects.select_for_update().filter(pk__in=[user.pk, target.pk]).order_by("pk"))
    Block.objects.get_or_create(blocker=user, blocked=target)
    Match.objects.filter(**pair_query(user, target)).update(active=False)
    Decision.objects.filter(Q(sender=user, receiver=target) | Q(sender=target, receiver=user)).delete()

def can_access_match(user, match):
    return match.active and user.pk in (match.user_low_id, match.user_high_id) and not is_blocked(match.user_low, match.user_high)


def can_report(user, target):
    if user.pk == target.pk:
        return False
    # Existing contacts can still report abuse after hiding or ending contact.
    known_contact = (
        Match.objects.filter(**pair_query(user, target)).exists()
        or Decision.objects.filter(sender=user, receiver=target).exists()
        or Block.objects.filter(blocker=user, blocked=target).exists()
    )
    if known_contact:
        return True
    return (
        hasattr(target, "profile") and target.profile.ready
        and target.profile.discoverable and not is_blocked(user, target)
    )


def undoable_decision(user):
    latest = Decision.objects.filter(sender=user).select_related("receiver__profile").order_by("-created_at", "-pk").first()
    if latest is None:
        return None
    target = latest.receiver
    if (not target.is_active or not hasattr(target, "profile")
            or not target.profile.ready or not target.profile.discoverable
            or is_blocked(user, target)
            or Match.objects.filter(**pair_query(user, target)).exists()):
        return None
    return latest


@transaction.atomic
def undo_last_decision(user):
    latest = undoable_decision(user)
    if latest is None:
        raise ContactUnavailable("暂无可以反悔的操作。已配对的联系请在配对中管理。")
    target = latest.receiver
    list(get_user_model().objects.select_for_update().filter(pk__in=[user.pk, target.pk]).order_by("pk"))
    checked = undoable_decision(user)
    if checked is None or checked.pk != latest.pk:
        raise ContactUnavailable("这次操作已发生变化，请刷新后重试。")
    latest.delete()
    return target.pk
