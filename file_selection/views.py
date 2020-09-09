from django.shortcuts import render


def config_creator(request):
    return render(request, 'file_selection/config_creator.html', {})


def training_data_creator(request):
    return render(request, 'file_selection/training_data_creator.html', {})


def setup(request):
    return render(request, 'file_selection/setup.html', {})


def docs(request):
    return render(request, 'file_selection/docs.html', {})


def file_selection(request):
    return render(request, 'file_selection/index.html', {})
