from . import views
from django.urls import path, include
from django.conf.urls import url

urlpatterns = [
    path('', views.file_selection, name='file_selection'),
    url(r'^getting-started/$', views.getting_started, name='getting_started'),
    url(r'^learn-more/$', views.learn_more, name='learn_more'),
    url(r'^create-configuration-file/$', views.create_config,
        name='create_config'),
    path('', include('annotate.urls'))
]
