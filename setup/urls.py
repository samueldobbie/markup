from django.urls import path, include

from . import views

app_name = 'setup'

urlpatterns = [
    path('setup/', views.setup, name='setup'),
    path('config-creator/', views.config_creator, name='config_creator'),
    path('training-data-creator/', views.training_data_creator, name='training_data_creator'),
]
