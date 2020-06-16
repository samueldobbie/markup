from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^annotate/$',
        views.annotate_data, name='annotate_data'),
    url(r'^annotate/~/suggest-cui$',
        views.suggest_cui, name='suggest_cui'),
    url(r'^annotate/~/initialise-active-learner$',
        views.initialise_active_learner, name='initialise_active_learner'),
    url(r'^annotate/~/get-annotation-suggestions$',
        views.get_annotation_suggestions, name='get_annotation_suggestions'),
    url(r'^setup/~/setup-preloaded-ontology$',
        views.setup_preloaded_ontology, name='setup_preloaded_ontology'),
    url(r'^annotate/~/query-active-learner',
        views.query_active_learner, name='query_active_learner'),
    url(r'^annotate/~/teach-active-learner',
        views.teach_active_learner, name='teach_active_learner'),
]
