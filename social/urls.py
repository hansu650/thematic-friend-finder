from django.urls import path
from . import views

urlpatterns = [
    path("", views.welcome, name="welcome"),
    path("signup/", views.signup, name="signup"),
    path("demo/", views.demo_login, name="demo_login"),
    path("discover/", views.discover, name="discover"),
    path("profile/", views.edit_profile, name="profile"),
    path("people/<int:user_id>/decision/", views.decision, name="decision"),
    path("discover/reset-skips/", views.reset_skips, name="reset_skips"),
    path("matches/", views.connections, name="connections"),
    path("matches/<int:match_id>/", views.match_detail, name="match_detail"),
    path("matches/<int:match_id>/end/", views.end_match, name="end_match"),
    path("messages/", views.inbox, name="inbox"),
    path("messages/<int:match_id>/", views.conversation, name="conversation"),
    path("messages/<int:match_id>/feed/", views.message_feed, name="message_feed"),
    path("messages/<int:match_id>/send/", views.send_message, name="send_message"),
    path("people/<int:user_id>/block/", views.block, name="block"),
    path("people/<int:user_id>/unblock/", views.unblock, name="unblock"),
    path("people/<int:user_id>/report/", views.report, name="report"),
    path("safety/", views.safety, name="safety"),
    path("privacy/", views.privacy, name="privacy"),
]
