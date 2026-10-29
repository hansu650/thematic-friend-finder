from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from social.models import Decision, Interest, Profile

INTERESTS = [("coffee", "咖啡"), ("photo", "摄影"), ("hiking", "徒步"), ("film", "电影"), ("music", "音乐"), ("reading", "阅读"), ("badminton", "羽毛球"), ("exhibitions", "看展"), ("coding", "编程"), ("cooking", "做饭"), ("running", "跑步"), ("gaming", "游戏")]
PEOPLE = [
    ("demo_zhou", "小周", "从一杯咖啡，开始认识。", "周末喜欢在城市里慢慢走。想认识能一起看电影、喝咖啡，也愿意分享日常的人。", "coffee", ["coffee", "photo", "film", "hiking"], "coral"),
    ("demo_lin", "林予安", "给平常的日子，留一点新鲜。", "喜欢用相机记录生活，也喜欢没有目的地的散步。最近想找人一起看展，结束后再喝一杯拿铁。", "coffee", ["coffee", "photo", "film", "exhibitions"], "sage"),
    ("demo_chen", "陈序", "书可以慢慢读，朋友慢慢认识。", "最近在读小说，周末会去爬山。想认识愿意一起读书、分享歌单和探索小店的朋友。", "explore", ["reading", "hiking", "coffee", "music"], "sand"),
    ("demo_tang", "唐宁", "运动之后，一起去吃点好的。", "羽毛球和慢跑爱好者，也在练习做饭。欢迎约一场轻松的球，再一起研究晚饭。", "sports", ["badminton", "running", "cooking"], "blue"),
    ("demo_lu", "陆遥", "一起专注，也一起放松。", "正在学习网页开发，喜欢把小想法做成能用的东西。想找一个能互相提醒进度的学习搭子。", "study", ["coding", "gaming", "reading"], "plum"),
    ("demo_xu", "许一诺", "把周末留给喜欢的事。", "会为了一场展览出门，也会为了喜欢的电影重看很多遍。希望认识一些兴趣相近的新朋友。", "explore", ["exhibitions", "film", "photo"], "coral"),
]

class Command(BaseCommand):
    help = "Create fictional local demo accounts; existing profiles and conversations are preserved."
    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEMO_MODE:
            raise CommandError("Demo setup is disabled.")
        interests = {}
        for slug, label in INTERESTS:
            interests[slug], _ = Interest.objects.get_or_create(slug=slug, defaults={"label": label})
        created_profiles = 0
        for username, name, headline, bio, goal, tags, accent in PEOPLE:
            user, created = User.objects.get_or_create(username=username)
            if not created and not Profile.objects.filter(user=user, is_demo=True).exists():
                raise CommandError("Refusing to reuse a non-demo account.")
            if created:
                user.set_unusable_password()
                user.save()
            profile, new_profile = Profile.objects.get_or_create(user=user, defaults={
                "display_name": name, "headline": headline, "bio": bio, "goal": goal,
                "adult_confirmed": True, "is_demo": True, "accent": accent,
            })
            if new_profile:
                profile.interests.set([interests[tag] for tag in tags])
                created_profiles += 1
        # Only initialise the illustrative incoming like for a completely fresh demo.
        if created_profiles == len(PEOPLE):
            Decision.objects.create(sender=User.objects.get(username="demo_lin"), receiver=User.objects.get(username="demo_zhou"), kind="like")
        self.stdout.write(self.style.SUCCESS(f"Ready: {len(PEOPLE)} fictional demo identities; {created_profiles} new profiles. No real personal data."))
