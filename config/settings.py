"""Local coursework settings. Public deployment requires explicit configuration."""
import os
import secrets
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
DEMO_MODE = os.environ.get("MEETLY_DEMO", "1" if DEBUG else "0") == "1"
if DEMO_MODE and not DEBUG:
    raise ImproperlyConfigured("Demo identity switching must be disabled outside development.")
DATA_DIR = Path(os.environ.get("MEETLY_DATA_DIR", str(BASE_DIR / ".local")))
DATA_DIR.mkdir(parents=True, exist_ok=True)
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured("Set DJANGO_SECRET_KEY for deployment.")
    secret_file = DATA_DIR / "secret_key"
    if not secret_file.exists():
        try:
            with secret_file.open("x", encoding="utf-8") as stream:
                stream.write(secrets.token_urlsafe(64))
        except FileExistsError:
            pass
    SECRET_KEY = secret_file.read_text(encoding="utf-8").strip()

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost,[::1]").split(",")
INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "social.apps.SocialConfig",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "templates"], "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
        "social.context_processors.app_context",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"
DATABASES = {"default": {
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": DATA_DIR / "db.sqlite3",
    "OPTIONS": {"timeout": 20},
}}
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
LANGUAGE_CODE = "zh-hans"
TIME_ZONE = "Asia/Shanghai"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / ".static"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "discover"
LOGOUT_REDIRECT_URL = "welcome"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
