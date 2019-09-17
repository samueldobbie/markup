from . import views
from django.urls import path, include

urlpatterns = [
    path('', views.file_selection, name='file_selection'),
    path('', include('annotate.urls'))
]
