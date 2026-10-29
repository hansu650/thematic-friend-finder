from django.contrib import admin
from .models import Block, Decision, Interest, Match, Message, Profile, Report

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["display_name", "user", "discoverable", "is_demo"]
    list_filter = ["discoverable", "is_demo"]
    filter_horizontal = ["interests"]

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["id", "reporter", "target", "reason", "status", "created_at"]
    list_filter = ["status", "reason"]
    readonly_fields = ["reporter", "target", "reason", "details", "created_at"]

admin.site.register([Interest, Match, Block])
admin.site.site_header = "同频 · 管理"
admin.site.site_title = "同频管理"
