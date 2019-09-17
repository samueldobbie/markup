from django.conf.urls import url
from . import views

urlpatterns = [
    url('', views.create_config_file, name='create_config_file'),
]
