from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^setup/~/is-valid-umls-user$',
        views.is_valid_umls_user, name='is_valid_umls_user'),
    url(r'^~/setup-demo$',
        views.setup_demo, name='setup_demo'),
    url(r'^setup/~/setup-preloaded-ontology$',
        views.setup_preloaded_ontology, name='setup_preloaded_ontology'),
    url(r'^setup/~/setup-custom-ontology$',
        views.setup_custom_ontology, name='setup_custom_ontology'),
    url(r'^annotate/$',
        views.annotate_data, name='annotate_data'),
    url(r'^annotate/~/suggest-cui$',
        views.suggest_cui, name='suggest_cui'),
    url(r'^annotate/~/suggest-annotations$',
        views.suggest_annotations, name='suggest_annotations')
]
