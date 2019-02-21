from django.shortcuts import render
import os

def annotate_data(request, file_path):
    os.chdir('/')
    data = open(file_path, encoding='utf8').read()
    return render(request, 'file_selection/index.html', {})
