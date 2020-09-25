from django.urls import path

from . import views

app_name = 'doc'
urlpatterns = [
    path('doc/', views.doc, name='doc'),
]
