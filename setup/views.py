from django.shortcuts import render

def setup(request):
    return render(request, 'setup/setup.html', {})


def config_creator(request):
    return render(request, 'setup/config_creator.html', {})


def training_data_creator(request):
    return render(request, 'setup/training_data_creator.html', {})
