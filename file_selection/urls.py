from . import views
from django.urls import path, include
from django.conf.urls import url

urlpatterns = [
    path('', views.file_selection, name='file_selection'),
    url(r'^setup/$', views.setup, name='setup'),
    url(r'^docs/$', views.docs, name='docs'),
    url(r'^config-creator/$', views.config_creator, name='config_creator'),
    path('', include('annotate.urls'))
]
