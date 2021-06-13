from django.http import HttpResponse
from django.shortcuts import render
import sqlite3
import json
import os

def setup(request):
    return render(request, 'setup.html', {})

def config_creator(request):
    return render(request, 'config_creator.html', {})

def data_generator(request):
    return render(request, 'data_generator.html', {})

def umls_auth(request):
    return render(request, 'umls_auth.html', {})

def search_term_exact(query):
    sql = """
        SELECT DISTINCT CUI, SAB, CODE, STR
        FROM MRCONSO
        WHERE STR = ?
    """
    params = (query,)
    return _query_umls(sql, params)

def search_term_relationship(query, relationship):
    sql = """
        SELECT DISTINCT B.CUI2 as CUI, C.SAB, C.CODE, C.STR
        FROM MRCONSO A
        INNER JOIN MRREL B
        ON A.CUI = B.CUI1
        INNER JOIN MRCONSO C
        ON B.CUI2 = C.CUI
        WHERE B.REL = ? AND A.STR = ?
    """
    params = (query, relationship)
    return _query_umls(sql, params)

def search_cui(query):
    sql = """
        SELECT DISTINCT CUI, SAB, CODE, STR
        FROM MRCONSO
        WHERE CUI = ?
    """
    params = (query,)
    return _query_umls(sql, params)

def search_code(query):
    sql = """
        SELECT DISTINCT CUI, SAB, CODE, STR
        FROM MRCONSO
        WHERE CODE = ?
    """
    params = (query,)
    return _query_umls(sql, params)

def search_cui_relationship(query, relationship):
    sql = """
        SELECT DISTINCT B.CUI2 as CUI, C.SAB, C.CODE, C.STR
        FROM MRCONSO A
        INNER JOIN MRREL B
        ON A.CUI = B.CUI1
        INNER JOIN MRCONSO C
        ON B.CUI2 = C.CUI
        WHERE B.REL = ? AND B.CUI1 = ?
    """
    params = (query, relationship)
    return _query_umls(sql, params)

def search_code_relationship(query, relationship):
    sql = """
        SELECT DISTINCT B.CUI2 as CUI, C.SAB, C.CODE, C.STR
        FROM MRCONSO A
        INNER JOIN MRREL B
        ON A.CUI = B.CUI1
        INNER JOIN MRCONSO C
        ON B.CUI2 = C.CUI
        WHERE B.REL = ? AND A.STR = ?
    """
    params = (query, relationship)
    return _query_umls(sql, params)

def _query_umls(query, params):
    try :
        umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
        cursor = umls.cursor()
        cursor.execute(query, params)
        results = cursor.fetchall()                 
        umls.close()
        return results
    except sqlite3.Error as error:
        print("Error while conneting to sqlite", error)

def search_umls(request):
    relationship = request.POST['relationship']
    method = request.POST['method']
    query = request.POST['query']
    
    if relationship == 'exact':
        if method == 'string':
            results = search_term_exact(query)
        elif method == 'cui':
            results = search_cui(query)
        else:
            results = search_code(query)
    else:
        if method == 'string':
            results = search_term_relationship(query, relationship)
        elif method == 'code':
            results = search_code_relationship(query, relationship)
        else:
            results = search_cui_relationship(query, relationship)

    return HttpResponse(json.dumps(results))
    
PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
umls_path = PATH + '/data/UMLS/'
