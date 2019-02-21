from django.shortcuts import render, redirect
from tkinter import filedialog
import tkinter as tk

def file_selection_template(request):
    if request.GET.get('open_file_button'):
        file_path = open_file(request)
        if file_path != '()' and len(file_path) != 0:
            return render(request, 'file_selection/index.html', {'file_path': file_path})
        else:
            return redirect('/')
    return render(request, 'file_selection/index.html', {})


def open_file(request):
    root = tk.Tk()
    root.withdraw()
    return str(filedialog.askopenfilename())

