"""
URL configuration for mishmob project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.http import JsonResponse
from ninja import NinjaAPI
from api.urls import setup_api_routes

def health_check(request):
    """Simple health check endpoint for Kubernetes probes"""
    return JsonResponse({"status": "healthy"}, status=200)

# Create the main API instance
api = NinjaAPI(
    title="MishMob API",
    version="1.0.0",
    description="API for MishMob volunteer matching platform"
)

# Setup API routes
setup_api_routes(api)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/', api.urls),
    # Only redirect non-API, non-admin paths to frontend
    path('', RedirectView.as_view(url='http://localhost:5173/', permanent=False)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
