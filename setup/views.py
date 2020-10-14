from django.shortcuts import render

def setup(request):
    return render(request, 'setup.html', {})


def config_creator(request):
    return render(request, 'config_creator.html', {})


def data_generator(request):
    return render(request, 'data_generator.html', {})
