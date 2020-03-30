from django.shortcuts import render
from django.http import HttpResponse


def create_config(request):
    return render(request, 'file_selection/create_config.html', {})


def getting_started(request):
    return render(request, 'file_selection/getting_started.html', {})


def learn_more(request):
    return render(request, 'file_selection/learn_more.html', {})


def file_selection(request):
    return render(request, 'file_selection/index.html', {})
