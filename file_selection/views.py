from django.shortcuts import render, redirect
from django.urls import reverse
import easygui

def file_selection_template(request):
    file_path = ''
    if request.method == 'GET':
        if request.GET.get('open_file_button'):
            file_path = easygui.fileopenbox()
            if file_path != None:
                return redirect('/annotate' + file_path)
            else:
                return redirect('/')
        elif request.GET.get('open_dir_button'):
            dir_path = easygui.fileopenbox()
            if dir_path != None:
                return redirect('/annotate' + dir_path)
            else:
                return redirect('/')
    return render(request, 'file_selection/index.html', {})