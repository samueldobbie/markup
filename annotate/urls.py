from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^annotate/$',
        views.annotate_data, name='annotate_data'),
    url(r'^annotate/~/suggest_cui$',
        views.suggest_cui, name='suggest_cui'),
    url(r'^annotate/~/get_cui$',
        views.get_cui, name='get_cui'),
]
