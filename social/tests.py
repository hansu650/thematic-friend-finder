from io import StringIO

from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from social.models import Block, Decision, Interest, Match, Message, Profile, Report
from social.services import ContactUnavailable, block_user, decide, recommendations


class SocialFlowTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.coffee = Interest.objects.create(slug="coffee", label="咖啡")
        cls.film = Interest.objects.create(slug="film", label="电影")
        cls.sport = Interest.objects.create(slug="sport", label="运动")
        for name in ("alice", "bob", "carol"):
            user = User.objects.create_user(username=name, password="test-only-pass-29481")
            profile = Profile.objects.create(user=user, display_name=name, bio="测试资料", adult_confirmed=True)
            profile.interests.add(cls.coffee, cls.film)
            setattr(cls, name, user)

    def setUp(self):
        self.client.force_login(self.alice)

    def matched(self):
        decide(self.alice, self.bob, "like")
        return decide(self.bob, self.alice, "like")

    def test_one_way_like_does_not_open_conversation(self):
        response = self.client.post(reverse("decision", args=[self.bob.pk]), {"kind": "like"})
        self.assertRedirects(response, reverse("discover"))
        self.assertFalse(Match.objects.exists())
        self.assertEqual(self.client.get(reverse("conversation", args=[999])).status_code, 404)

    def test_reciprocal_like_creates_only_one_match(self):
        match = self.matched()
        self.assertIsNotNone(match)
        self.assertEqual(decide(self.alice, self.bob, "like").pk, match.pk)
        self.assertEqual(Match.objects.count(), 1)

    def test_skip_excludes_and_reset_restores_without_resetting_likes(self):
        decide(self.alice, self.bob, "skip")
        decide(self.alice, self.carol, "like")
        self.assertEqual(recommendations(self.alice), [])
        self.client.post(reverse("reset_skips"))
        self.assertEqual([r["profile"].user_id for r in recommendations(self.alice)], [self.bob.pk])
        self.assertTrue(Decision.objects.filter(sender=self.alice, receiver=self.carol, kind="like").exists())

    def test_hidden_and_incomplete_profiles_are_not_recommended(self):
        Profile.objects.filter(user=self.bob).update(discoverable=False)
        self.carol.profile.interests.clear()
        self.assertEqual(recommendations(self.alice), [])

    def test_explanations_and_filters_agree_with_interests(self):
        self.bob.profile.interests.set([self.sport])
        Profile.objects.filter(user=self.bob).update(goal="sports")
        rows = recommendations(self.alice, interest="coffee", goal="coffee")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["profile"].user_id, self.carol.pk)
        self.assertEqual({item.slug for item in rows[0]["shared"]}, {"coffee", "film"})
        self.assertEqual(recommendations(self.alice)[0]["profile"].user_id, self.carol.pk)

    def test_anonymous_cannot_access_private_routes(self):
        self.client.logout()
        for route in ("discover", "connections", "inbox", "profile", "safety"):
            with self.subTest(route=route):
                self.assertEqual(self.client.get(reverse(route)).status_code, 302)

    def test_nonparticipant_cannot_read_feed_or_send(self):
        match = self.matched()
        self.client.force_login(self.carol)
        for route in ("match_detail", "conversation", "message_feed"):
            with self.subTest(route=route):
                self.assertEqual(self.client.get(reverse(route, args=[match.pk])).status_code, 404)
        self.assertEqual(self.client.post(reverse("send_message", args=[match.pk]), {"body": "not allowed"}).status_code, 404)
        self.assertFalse(Message.objects.exists())

    def test_send_receive_and_cursor(self):
        match = self.matched()
        response = self.client.post(reverse("send_message", args=[match.pk]), {"body": "你好"}, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 201)
        first = Message.objects.get()
        self.client.force_login(self.bob)
        data = self.client.get(reverse("message_feed", args=[match.pk])).json()["messages"]
        self.assertEqual(data[0]["body"], "你好")
        self.assertFalse(data[0]["mine"])
        self.assertEqual(self.client.get(reverse("message_feed", args=[match.pk]), {"after": first.pk}).json()["messages"], [])

    def test_invalid_message_is_rejected(self):
        match = self.matched()
        for body in ("   ", "x" * 1001):
            with self.subTest(length=len(body)):
                self.assertEqual(self.client.post(reverse("send_message", args=[match.pk]), {"body": body}, HTTP_ACCEPT="application/json").status_code, 400)
        self.assertFalse(Message.objects.exists())

    def test_invalid_feed_cursor_is_rejected(self):
        match = self.matched()
        self.assertEqual(self.client.get(reverse("message_feed", args=[match.pk]), {"after": "oops"}).status_code, 400)

    def test_message_is_escaped_in_rendered_html(self):
        match = self.matched()
        Message.objects.create(match=match, sender=self.bob, body='<script>alert("x")</script>')
        response = self.client.get(reverse("conversation", args=[match.pk]))
        self.assertContains(response, "&lt;script&gt;")
        self.assertNotContains(response, '<script>alert("x")</script>')

    def test_block_revokes_existing_chat_and_recommendations_both_ways(self):
        match = self.matched()
        self.client.post(reverse("block", args=[self.bob.pk]))
        match.refresh_from_db()
        self.assertFalse(match.active)
        self.assertTrue(Block.objects.filter(blocker=self.alice, blocked=self.bob).exists())
        for current, target in ((self.alice, self.bob), (self.bob, self.alice)):
            self.client.force_login(current)
            self.assertNotIn(target.pk, [r["profile"].user_id for r in recommendations(current)])
            self.assertEqual(self.client.get(reverse("message_feed", args=[match.pk])).status_code, 404)
            self.assertEqual(self.client.post(reverse("send_message", args=[match.pk]), {"body": "blocked"}).status_code, 404)

    def test_unblock_does_not_restore_closed_match(self):
        match = self.matched()
        block_user(self.alice, self.bob)
        self.client.post(reverse("unblock", args=[self.bob.pk]))
        self.assertFalse(Block.objects.exists())
        match.refresh_from_db()
        self.assertFalse(match.active)
        with self.assertRaises(ContactUnavailable):
            decide(self.alice, self.bob, "like")

    def test_end_match_closes_chat_and_cannot_reopen_by_like(self):
        match = self.matched()
        self.client.post(reverse("end_match", args=[match.pk]))
        self.assertEqual(self.client.get(reverse("conversation", args=[match.pk])).status_code, 404)
        with self.assertRaises(ContactUnavailable):
            decide(self.bob, self.alice, "like")

    def test_csrf_and_post_only_state_changes(self):
        csrf_client = Client(enforce_csrf_checks=True)
        csrf_client.force_login(self.alice)
        self.assertEqual(csrf_client.post(reverse("decision", args=[self.bob.pk]), {"kind": "like"}).status_code, 403)
        self.assertEqual(self.client.get(reverse("decision", args=[self.bob.pk])).status_code, 405)
        self.assertEqual(self.client.get(reverse("block", args=[self.bob.pk])).status_code, 405)
        self.assertFalse(Decision.objects.exists())

    def test_own_or_hidden_profile_cannot_be_liked(self):
        with self.assertRaises(ContactUnavailable):
            decide(self.alice, self.alice, "like")
        self.bob.profile.discoverable = False
        self.bob.profile.save()
        with self.assertRaises(ContactUnavailable):
            decide(self.alice, self.bob, "like")

    def test_report_does_not_reveal_unknown_hidden_profile(self):
        Profile.objects.filter(user=self.bob).update(discoverable=False)
        self.assertEqual(self.client.get(reverse("report", args=[self.bob.pk])).status_code, 404)

    def test_report_remains_possible_after_blocking_a_match(self):
        self.matched()
        block_user(self.alice, self.bob)
        response = self.client.post(reverse("report", args=[self.bob.pk]), {"reason": "harassment", "details": "虚构测试案例"})
        self.assertRedirects(response, reverse("safety"))
        record = Report.objects.get()
        self.assertEqual((record.reporter_id, record.target_id), (self.alice.pk, self.bob.pk))
        self.client.force_login(self.carol)
        self.assertNotContains(self.client.get(reverse("safety")), "bob")

    def test_profile_interest_limit_and_required_bio(self):
        extra = [Interest.objects.create(slug=f"tag{i}", label=f"标签{i}") for i in range(7)]
        payload = {"display_name": "Alice", "bio": "介绍", "campus": "校园", "goal": "coffee", "interests": [item.pk for item in extra], "discoverable": "on"}
        response = self.client.post(reverse("profile"), payload)
        self.assertContains(response, "最多选择 6 项兴趣")
        payload.update(interests=[self.coffee.pk], bio="   ")
        self.assertContains(self.client.post(reverse("profile"), payload), "写一点关于你的介绍")

    def test_signup_requires_adult_confirmation_and_hashes_password(self):
        self.client.logout()
        payload = {"username": "newperson", "display_name": "新朋友", "password1": "test-only-59318-Q!", "password2": "test-only-59318-Q!"}
        self.client.post(reverse("signup"), payload)
        self.assertFalse(User.objects.filter(username="newperson").exists())
        payload["adult_confirmed"] = "on"
        self.assertRedirects(self.client.post(reverse("signup"), payload), reverse("profile"))
        created = User.objects.get(username="newperson")
        self.assertTrue(created.check_password(payload["password1"]))
        self.assertNotEqual(created.password, payload["password1"])
        self.assertFalse(created.profile.ready)

    def test_incomplete_account_redirects_to_profile(self):
        self.alice.profile.bio = ""
        self.alice.profile.save()
        self.assertRedirects(self.client.get(reverse("discover")), reverse("profile"))

    @override_settings(DEMO_MODE=False)
    def test_demo_login_is_disabled_when_demo_mode_is_off(self):
        self.assertEqual(self.client.post(reverse("demo_login"), {"identity": "alice"}).status_code, 404)

    @override_settings(DEMO_MODE=True)
    def test_demo_login_cannot_impersonate_real_accounts(self):
        self.assertEqual(self.client.post(reverse("demo_login"), {"identity": "alice"}).status_code, 404)

    @override_settings(DEMO_MODE=True)
    def test_seed_is_idempotent_and_preserves_edits(self):
        call_command("seed_demo", stdout=StringIO())
        Profile.objects.filter(user__username="demo_zhou").update(bio="保留测试编辑")
        call_command("seed_demo", stdout=StringIO())
        self.assertEqual(Profile.objects.filter(is_demo=True).count(), 6)
        self.assertEqual(Profile.objects.get(user__username="demo_zhou").bio, "保留测试编辑")

    def test_representative_pages_render(self):
        match = self.matched()
        for route in ("discover", "connections", "inbox", "profile", "safety", "privacy"):
            with self.subTest(route=route):
                self.assertEqual(self.client.get(reverse(route)).status_code, 200)
        for route in ("match_detail", "conversation"):
            self.assertEqual(self.client.get(reverse(route, args=[match.pk])).status_code, 200)


    def test_superlike_requires_reciprocal_consent(self):
        self.client.post(reverse("decision", args=[self.bob.pk]), {"kind": "star"})
        self.assertFalse(Match.objects.exists())
        self.assertEqual(Decision.objects.get(sender=self.alice).kind, "star")
        self.assertIsNotNone(decide(self.bob, self.alice, "like"))
        self.assertEqual(Match.objects.count(), 1)

    def test_two_superlikes_create_one_match(self):
        decide(self.alice, self.bob, "star")
        match = decide(self.bob, self.alice, "star")
        self.assertEqual(decide(self.alice, self.bob, "star").pk, match.pk)
        self.assertEqual(Match.objects.count(), 1)

    def test_rewind_restores_exact_latest_profile_first(self):
        decide(self.alice, self.bob, "skip")
        decide(self.alice, self.carol, "star")
        response = self.client.post(reverse("undo_decision"), follow=True)
        self.assertEqual(response.context["candidate"]["profile"].user_id, self.carol.pk)
        self.assertFalse(Decision.objects.filter(sender=self.alice, receiver=self.carol).exists())
        self.assertTrue(Decision.objects.filter(sender=self.alice, receiver=self.bob).exists())

    def test_rewind_does_not_revoke_an_existing_match(self):
        match = self.matched()
        self.client.post(reverse("undo_decision"))
        match.refresh_from_db()
        self.assertTrue(match.active)
        self.assertTrue(Decision.objects.filter(sender=self.alice, receiver=self.bob).exists())

    def test_rewind_respects_hidden_and_blocked_profiles(self):
        decide(self.alice, self.bob, "skip")
        Profile.objects.filter(user=self.bob).update(discoverable=False)
        self.client.post(reverse("undo_decision"))
        self.assertTrue(Decision.objects.filter(sender=self.alice, receiver=self.bob).exists())
        Profile.objects.filter(user=self.bob).update(discoverable=True)
        Block.objects.create(blocker=self.bob, blocked=self.alice)
        self.client.post(reverse("undo_decision"))
        self.assertTrue(Decision.objects.filter(sender=self.alice, receiver=self.bob).exists())

    def test_rewind_requires_post_and_csrf(self):
        decide(self.alice, self.bob, "skip")
        self.assertEqual(self.client.get(reverse("undo_decision")).status_code, 405)
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.alice)
        self.assertEqual(client.post(reverse("undo_decision")).status_code, 403)
        self.assertTrue(Decision.objects.filter(sender=self.alice, receiver=self.bob).exists())
