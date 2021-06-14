from django.urls import path

from . import views

urlpatterns = [
    path('', views.setup, name='setup'),
    path('umls-auth/', views.umls_auth, name='umls_auth'),
]
