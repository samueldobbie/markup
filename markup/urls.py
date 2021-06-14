from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from django.conf import settings

urlpatterns = [
    path('', include('home.urls')),
    path('doc/', include('doc.urls')),
    path('setup/', include('setup.urls')),
    path('tools/', include('tools.urls')),
    path('annotate/', include('annotate.urls')),
    path('admin/', admin.site.urls),
    
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': settings.STATIC_ROOT
    }),
]
