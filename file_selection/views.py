import PySimpleGUI as gui

from annotate import views as annotate_views
from django.shortcuts import render, redirect
from django.urls import reverse


def getting_started(request):
    return render(request, 'file_selection/getting_started.html', {})


def learn_more(request):
    return render(request, 'file_selection/learn_more.html', {})


def file_selection(request):
    # Reset currently opened file lists
    annotate_views.current_file = ''
    annotate_views.next_files = []
    annotate_views.previous_files = []
    annotate_views.total_file_count = 1

    # Open file or folder depending on selected option
    file_path = ''
    if request.method == 'GET':
        if request.GET.get('open_file_button'):
            try:
                file_path = gui.PopupGetFile('Choose a file',
                                             no_window=True)
                if file_path[0] != '/':
                    return redirect('/annotate/' + file_path)
                else:
                    return redirect('/annotate' + file_path)
            except:
                return redirect('/')
        elif request.GET.get('open_dir_button'):
            try:
                dir_path = gui.PopupGetFolder('Choose a folder',
                                              no_window=True)
                if dir_path[0] != '/':
                    return redirect('/annotate/' + dir_path)
                else:
                    return redirect('/annotate' + dir_path)
            except:
                return redirect('/')
    return render(request, 'file_selection/index.html', {})
