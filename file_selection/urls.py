from . import views
from django.urls import path, include

urlpatterns = [
    path('', views.file_selection_template, name='file_selection_template'),
    path('', include('annotate.urls'))
]
