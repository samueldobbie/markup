from django.conf.urls import url

from . import views

urlpatterns = [
    url('', views.annotate_data, name='annotate_data'),
    url('suggest-cui/', views.suggest_cui, name='suggest_cui'),
    url('suggest-annotations/', views.suggest_annotations, name='suggest_annotations'),
    url('teach-active-learner/', views.teach_active_learner, name='teach_active_learner'),
    url('reset-ontology/', views.reset_ontology, name='reset_ontology'),
    url('setup-demo/', views.setup_demo, name='setup_demo'),
    url('setup-umls/', views.setup_umls, name='setup_umls'),
    url('setup-preloaded-ontology/', views.setup_preloaded_ontology, name='setup_preloaded_ontology'),
    url('setup-custom-ontology/', views.setup_custom_ontology, name='setup_custom_ontology'),
]
