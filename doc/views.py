from django.shortcuts import render

def doc(request):
    return render(request, 'doc/doc.html', {})