from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('home.urls')),
    path('setup/', include('setup.urls')),
    path('doc/', include('doc.urls')),
    path('annotate/', include('annotate.urls')),
    path('compare/', include('compare.urls')),
    path('admin/', admin.site.urls),
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': settings.STATIC_ROOT
    }),
]
