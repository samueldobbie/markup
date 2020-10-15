from django.urls import path, include

from . import views

urlpatterns = [
    path('', views.setup, name='setup'),
    path('config-creator/', views.config_creator, name='config_creator'),
    path('data-generator/', views.data_generator, name='data_generator'),
]
