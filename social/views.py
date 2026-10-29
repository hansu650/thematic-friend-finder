from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST
from .forms import MessageForm, ProfileForm, ReportForm, SignupForm
from .models import Block, Decision, Interest, Match, Message, Profile, Report
from .services import ContactUnavailable, block_user, can_access_match, can_report, decide, matches_for, recommendations

def welcome(request):
    if request.user.is_authenticated:
        return redirect("discover")
    return render(request, "social/welcome.html")

def signup(request):
    if request.user.is_authenticated:
        return redirect("discover")
    form = SignupForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        with transaction.atomic():
            user = form.save()
        login(request, user)
        return redirect("profile")
    return render(request, "social/signup.html", {"form": form})

@login_required
def edit_profile(request):
    profile, _ = Profile.objects.get_or_create(user=request.user, defaults={"display_name": request.user.username})
    form = ProfileForm(request.POST or None, instance=profile)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "资料已保存，新的兴趣也会用于推荐。")
        return redirect("discover")
    return render(request, "social/profile.html", {"form": form, "page": "profile"})

@login_required
def discover(request):
    if not hasattr(request.user, "profile") or not request.user.profile.ready:
        return redirect("profile")
    interest = request.GET.get("interest", "")
    goal = request.GET.get("goal", "")
    if interest and not Interest.objects.filter(slug=interest).exists():
        interest = ""
    if goal not in dict(Profile.GOALS):
        goal = ""
    candidates = recommendations(request.user, interest, goal)
    return render(request, "social/discover.html", {
        "page": "discover", "candidate": candidates[0] if candidates else None,
        "candidate_count": len(candidates), "all_interests": Interest.objects.all(),
        "goals": Profile.GOALS, "selected_interest": interest, "selected_goal": goal,
        "has_filters": bool(interest or goal),
    })

@login_required
@require_POST
def decision(request, user_id):
    target = get_object_or_404(User.objects.select_related("profile"), pk=user_id, is_active=True)
    if not hasattr(target, "profile"):
        raise Http404
    try:
        match = decide(request.user, target, request.POST.get("kind"))
    except ContactUnavailable as exc:
        messages.info(request, str(exc))
        return redirect("discover")
    if match:
        messages.success(request, "你们互相喜欢，新的连接开始了。")
        return redirect("match_detail", match_id=match.pk)
    if request.POST.get("kind") == "like":
        messages.success(request, "喜欢已记录，互相喜欢后就能聊天。")
    return redirect("discover")

@login_required
@require_POST
def reset_skips(request):
    Decision.objects.filter(sender=request.user, kind="skip").delete()
    messages.info(request, "已将跳过的资料放回推荐。")
    return redirect("discover")

@login_required
def connections(request):
    connections = [{"match": item, "person": item.other(request.user).profile} for item in matches_for(request.user)]
    return render(request, "social/connections.html", {"connections": connections, "page": "matches"})

@login_required
def inbox(request):
    rows = []
    for item in matches_for(request.user).prefetch_related("chat_messages"):
        last = list(item.chat_messages.all())[-1:]
        rows.append({"match": item, "person": item.other(request.user).profile, "last_message": last[0] if last else None})
    rows.sort(key=lambda row: row["last_message"].created_at if row["last_message"] else row["match"].created_at, reverse=True)
    return render(request, "social/inbox.html", {"connections": rows, "page": "messages"})

def _get_match(request, match_id):
    match = get_object_or_404(Match.objects.select_related("user_low__profile", "user_high__profile"), pk=match_id)
    if not can_access_match(request.user, match):
        raise Http404
    return match

@login_required
def match_detail(request, match_id):
    match = _get_match(request, match_id)
    person = match.other(request.user).profile
    shared = person.interests.filter(id__in=request.user.profile.interests.values_list("id", flat=True))
    return render(request, "social/match.html", {"match": match, "person": person, "shared": shared, "page": "matches"})

@login_required
def conversation(request, match_id):
    match = _get_match(request, match_id)
    person = match.other(request.user).profile
    history = list(match.chat_messages.select_related("sender").order_by("-id")[:100])[::-1]
    return render(request, "social/conversation.html", {
        "match": match, "person": person, "history": history, "page": "messages",
        "last_id": history[-1].pk if history else 0, "report_form": ReportForm(),
    })

@login_required
def message_feed(request, match_id):
    match = _get_match(request, match_id)
    try:
        after = max(0, int(request.GET.get("after", "0")))
    except ValueError:
        return JsonResponse({"error": "消息位置无效。"}, status=400)
    records = match.chat_messages.filter(id__gt=after).order_by("id")[:100]
    return JsonResponse({"messages": [{
        "id": item.pk, "body": item.body, "mine": item.sender_id == request.user.pk,
        "time": item.created_at.isoformat(),
    } for item in records]})

@login_required
@require_POST
def send_message(request, match_id):
    form = MessageForm(request.POST)
    if not form.is_valid():
        if request.headers.get("Accept") == "application/json":
            return JsonResponse({"error": "消息不能为空，且不能超过 1000 字。"}, status=400)
        messages.error(request, "消息不能为空，且不能超过 1000 字。")
        return redirect("conversation", match_id=match_id)
    with transaction.atomic():
        match = get_object_or_404(Match.objects.select_for_update(), pk=match_id)
        if not can_access_match(request.user, match):
            raise Http404
        Message.objects.create(match=match, sender=request.user, body=form.cleaned_data["body"])
    if request.headers.get("Accept") == "application/json":
        return JsonResponse({"ok": True}, status=201)
    return redirect("conversation", match_id=match_id)

@login_required
@require_POST
def end_match(request, match_id):
    match = _get_match(request, match_id)
    match.active = False
    match.save(update_fields=["active"])
    messages.success(request, "已解除匹配，这段对话已关闭。")
    return redirect("connections")

@login_required
@require_POST
def block(request, user_id):
    target = get_object_or_404(User, pk=user_id)
    try:
        block_user(request.user, target)
    except ContactUnavailable:
        raise Http404
    messages.success(request, "已屏蔽对方，你们不会再互相出现在推荐中。")
    return redirect("discover")

@login_required
def report(request, user_id):
    target = get_object_or_404(Profile.objects.select_related("user"), user_id=user_id, user__is_active=True)
    if not can_report(request.user, target.user):
        raise Http404
    form = ReportForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        record = form.save(commit=False)
        record.reporter = request.user
        record.target = target.user
        record.save()
        messages.success(request, "举报已保存，将由管理员查看。")
        return redirect("safety")
    return render(request, "social/report.html", {"form": form, "person": target, "page": "safety"})

@login_required
def safety(request):
    blocks = Block.objects.filter(blocker=request.user).select_related("blocked__profile")
    reports = Report.objects.filter(reporter=request.user).select_related("target__profile")
    return render(request, "social/safety.html", {"blocks": blocks, "reports": reports, "page": "safety"})

@login_required
@require_POST
def unblock(request, user_id):
    Block.objects.filter(blocker=request.user, blocked_id=user_id).delete()
    messages.info(request, "已取消屏蔽。已解除的匹配不会自动恢复。")
    return redirect("safety")

def privacy(request):
    return render(request, "social/privacy.html", {"page": "safety"})

@require_POST
def demo_login(request):
    if not settings.DEMO_MODE:
        raise Http404
    profile = get_object_or_404(Profile.objects.select_related("user"), user__username=request.POST.get("identity"), is_demo=True, user__is_active=True)
    login(request, profile.user, backend="django.contrib.auth.backends.ModelBackend")
    return redirect("discover")
