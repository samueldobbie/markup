from django.conf.urls import url
from . import views
from django.urls import include, path

urlpatterns = [
    url(r'^annotate/$',
        views.annotate_data_two, name='annotate_data_two'),

    url(r'^annotate/~/suggest_cui$',
        views.suggest_cui, name='suggest_cui'),

    url(r'^annotate/~/get_cui$',
        views.get_cui, name='get_cui'),
]

'''
    url(r'^finished/$',
        views.finished, name='finished'),

    url(r'^annotate/(?P<data_file_path>[\s\S]+)/~/move_to_next_file$',
        views.move_to_next_file, name='move_to_next_file'),

    url(r'^annotate/(?P<data_file_path>[\s\S]+)/~/load_user_dictionary$',
        views.load_user_dictionary, name='load_user_dictionary'),

    url(r'^annotate/(?P<data_file_path>[\s\S]+)/~/move_to_previous_file$',
        views.move_to_previous_file, name='move_to_previous_file'),

    url(r'^annotate/~/auto_annotate$',
        views.auto_annotate, name='auto_annotate'),
'''