from django.urls import path

from . import views

urlpatterns = [
    path('', views.compare, name='compare'),
    path('iaa/', views.inter_annotator_agreement, name='iaa'),
    path('iaa/run-IAA/', views.runEverything, name='run-IAA'),
]
