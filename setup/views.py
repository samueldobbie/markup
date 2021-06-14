from django.shortcuts import render

def setup(request):
    return render(request, 'setup.html', {})

def umls_auth(request):
    return render(request, 'umls_auth.html', {})
