from . import views
from django.conf.urls import url

urlpatterns = [
    url(r'^annotate/(?P<data_file_path>[\s\S]+)/$', views.annotate_data, name='annotate_data'),
]
