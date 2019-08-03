from django.shortcuts import render, redirect
from django.urls import reverse
from annotate import views as annotate_views
import PySimpleGUI as gui

def file_selection_template(request):
    # Reset currently opened file lists
    annotate_views.current_file = ''
    annotate_views.next_files = []
    annotate_views.previous_files = []
    annotate_views.total_file_count = 1

    file_path = ''
    if request.method == 'GET':
        if request.GET.get('open_file_button'):
            file_path = gui.PopupGetFile("Choose a file", no_window=True)
            if file_path != None and file_path != ():
                return redirect('/annotate' + file_path)
            else:
                return redirect('/')
        elif request.GET.get('open_dir_button'):
            dir_path = gui.PopupGetFolder("Choose a folder", no_window=True)
            if dir_path != None and dir_path != ():
                return redirect('/annotate' + dir_path)
            else:
                return redirect('/')
    return render(request, 'file_selection/index.html', {})