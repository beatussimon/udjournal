"""
Django settings for backend project.
"""

import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'daphne',
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'analytics',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = []

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = 'backend.asgi.application'

# Database - not needed for this analytics-only backend
# We use Redis for data storage
DATABASES = {}

# Redis Configuration
REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
REDIS_DB = int(os.environ.get('REDIS_DB', 0))

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Channel layers for WebSockets
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    }
}

# WebSocket URL for SSE/WS
WS_URL = os.environ.get('WS_URL', 'ws://localhost:8001')

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/minute',
    }
}

# CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# OJS Configuration
OJS_BASE_URL = os.environ.get('OJS_BASE_URL', 'http://ojs:8080')
OJS_API_KEY = os.environ.get('OJS_API_KEY', '')

# OJS Journals - Configure these from environment variable (comma-separated list)
# Format: path1:id1,path2:id2  (e.g., "innovative-minds:1,bright-tomorrow:2")
OJS_JOURNALS_CONFIG = os.environ.get('OJS_JOURNALS', 'innovative-minds:1,bright-tomorrow:2')
OJS_JOURNALS = []
if OJS_JOURNALS_CONFIG:
    for item in OJS_JOURNALS_CONFIG.split(','):
        parts = item.split(':')
        if len(parts) == 2:
            OJS_JOURNALS.append({'path': parts[0].strip(), 'id': int(parts[1].strip())})

# Matomo Configuration
MATOMO_BASE_URL = os.environ.get('MATOMO_BASE_URL', 'http://matomo:8085')
MATOMO_TOKEN = os.environ.get('MATOMO_TOKEN', '')
MATOMO_SITE_ID = int(os.environ.get('MATOMO_SITE_ID', 1))

# Serper API Configuration (for citation tracking)
SERPER_API_KEY = os.environ.get('SERPER_API_KEY', '')

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = False
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
