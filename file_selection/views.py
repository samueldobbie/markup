from django.shortcuts import render, redirect
from django.urls import reverse
from tkinter import filedialog
import tkinter as tk

def file_selection_template(request):
    if request.method == 'GET':
        if request.GET.get('open_file_button'):
            root = tk.Tk()
            root.withdraw()
            file_path = str(filedialog.askopenfilename())
            if file_path != '()' and len(file_path) != 0:
                return redirect('/annotate' + file_path)
            else:
                return redirect('/')
    return render(request, 'file_selection/index.html', {})


def open_file(request):
    root = tk.Tk()
    root.withdraw()
    return str(filedialog.askopenfilename())

