from django.urls import path

from . import views

urlpatterns = [
    path('config-creator/', views.config_creator, name='config_creator'),
    path('data-generator/', views.data_generator, name='data_generator'),
]
