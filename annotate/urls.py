from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^setup/~/is-valid-umls-user$',
        views.is_valid_umls_user, name='is_valid_umls_user'),
    url(r'^setup/~/setup-demo-documents$',
        views.setup_demo_documents, name='setup_demo_documents'),
    url(r'^setup/~/setup-demo-config$',
        views.setup_demo_config, name='setup_demo_config'),
    url(r'^setup/~/setup-demo-ontology$',
        views.setup_demo_ontology, name='setup_demo_ontology'),
    url(r'^setup/~/setup-preloaded-ontology$',
        views.setup_preloaded_ontology, name='setup_preloaded_ontology'),
    url(r'^setup/~/setup-custom-ontology$',
        views.setup_custom_ontology, name='setup_custom_ontology'),
    url(r'^annotate/$',
        views.annotate_data, name='annotate_data'),
    url(r'^annotate/~/suggest-cui$',
        views.suggest_cui, name='suggest_cui'),
    url(r'^annotate/~/suggest-annotations$',
        views.suggest_annotations, name='suggest_annotations'),
    url(r'^annotate/~/teach-active-learner',
        views.teach_active_learner, name='teach_active_learner'),
    url(r'^annotate/~/query-active-learner',
        views.query_active_learner, name='query_active_learner'),
]
