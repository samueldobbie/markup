from django.shortcuts import render


# Create your views here.
def create_config_file(request):
    return render(request, 'config_creator/config_creator.html', {})
