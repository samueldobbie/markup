from file_selection import views
from django.urls import path

urlpatterns = [
    path('', views.file_selection_template, name='file_selection_template'),
]
