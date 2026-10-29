from django.conf import settings
from .models import Profile
from .services import matches_for

def app_context(request):
    data = {"demo_mode": settings.DEMO_MODE}
    if request.user.is_authenticated:
        data["my_profile"] = Profile.objects.filter(user=request.user).prefetch_related("interests").first()
        data["match_count"] = matches_for(request.user).count()
    if settings.DEMO_MODE:
        data["demo_profiles"] = Profile.objects.filter(is_demo=True, user__is_active=True).select_related("user").order_by("id")
    return data
