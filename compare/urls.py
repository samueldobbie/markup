from django.urls import path

from . import views

urlpatterns = [
    path('', views.compare, name='compare'),
    path('iaa/', views.inter_annotator_agreement, name='iaa'),
    path('iaa/run-IAA/', views.runEverything, name='run-IAA'),
    path('iaa/run-IAA-all/', views.runEverything2, name='run-IAA'),
    path('iaa/run-IAA-entities/', views.get_f1score_per_annotationCorpusHTML, name='run-IAA'),
    path('iaa/view-Difference-Only/', views.getDiffAnnfile, name='run-IAA'),
]
