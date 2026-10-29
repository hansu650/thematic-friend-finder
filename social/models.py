from django.conf import settings
from django.core.validators import MaxLengthValidator
from django.db import models
from django.db.models import F, Q

class Interest(models.Model):
    slug = models.SlugField(unique=True)
    label = models.CharField(max_length=20)
    class Meta:
        ordering = ["id"]
    def __str__(self):
        return self.label

class Profile(models.Model):
    GOALS = [("coffee", "喝杯咖啡"), ("study", "一起学习"), ("sports", "运动搭子"), ("explore", "周末探索")]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    display_name = models.CharField(max_length=24)
    headline = models.CharField(max_length=60, blank=True)
    bio = models.CharField(max_length=300, blank=True)
    campus = models.CharField(max_length=32, default="联合学院")
    goal = models.CharField(max_length=12, choices=GOALS, default="coffee")
    interests = models.ManyToManyField(Interest, blank=True)
    discoverable = models.BooleanField(default=True)
    adult_confirmed = models.BooleanField(default=False)
    is_demo = models.BooleanField(default=False, editable=False)
    accent = models.CharField(max_length=12, default="coral", editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.display_name
    @property
    def initials(self):
        return self.display_name[:2]
    @property
    def ready(self):
        return self.adult_confirmed and bool(self.bio.strip()) and self.interests.exists()

class Decision(models.Model):
    KINDS = [("like", "喜欢"), ("skip", "跳过")]
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="decisions_sent")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="decisions_received")
    kind = models.CharField(max_length=4, choices=KINDS)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["sender", "receiver"], name="one_decision_per_pair_direction"),
            models.CheckConstraint(condition=~Q(sender=F("receiver")), name="cannot_decide_on_self"),
        ]

class Match(models.Model):
    user_low = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches_low")
    user_high = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches_high")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user_low", "user_high"], name="one_match_per_pair"),
            models.CheckConstraint(condition=Q(user_low__lt=F("user_high")), name="match_users_in_order"),
        ]
        ordering = ["-created_at"]
    def other(self, user):
        if user.pk == self.user_low_id:
            return self.user_high
        if user.pk == self.user_high_id:
            return self.user_low
        raise ValueError("User does not belong to this match.")

class Block(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_made")
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_received")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="one_block_per_direction"),
            models.CheckConstraint(condition=~Q(blocker=F("blocked")), name="cannot_block_self"),
        ]

class Message(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="chat_messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField(validators=[MaxLengthValidator(1000)])
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["id"]

class Report(models.Model):
    REASONS = [("harassment", "骚扰或不友善"), ("spam", "广告或垃圾信息"), ("privacy", "隐私问题"), ("other", "其他问题")]
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports_made")
    target = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports_received")
    reason = models.CharField(max_length=16, choices=REASONS)
    details = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=12, choices=[("new", "待处理"), ("reviewed", "已查看"), ("resolved", "已处理")], default="new")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]
        constraints = [models.CheckConstraint(condition=~Q(reporter=F("target")), name="cannot_report_self")]
