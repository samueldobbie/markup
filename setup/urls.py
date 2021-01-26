from django.urls import path, include

from . import views

urlpatterns = [
    path('config-creator/', views.config_creator, name='config_creator'),
    path('data-generator/', views.data_generator, name='data_generator'),
    path('data-generator/search-umls/', views.search_umls, name='search_umls'),
    path('', views.setup, name='setup'),
]
