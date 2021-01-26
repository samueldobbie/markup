from django.shortcuts import render
import sqlite3
from django.http import HttpResponse
import os
import json
import urllib.request
import requests

def setup(request):
    return render(request, 'setup.html', {})


def config_creator(request):
    return render(request, 'config_creator.html', {})


def data_generator(request):
    return render(request, 'data_generator.html', {})



PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
umls_path = PATH + '/data/UMLS/'

# def search_umls(request):
#     return HttpResponse(json.dumps(umls_path))

# def search_umls(request):
#     Relationship = request.POST['Relationship']
#     Method = request.POST['Method']
#     inPut = request.POST['input']
#     Relationship1 = Relationship + "abc"
#     Method1 = Method + "def"
#     inPut1 = inPut + "ghi"
#     results = [inPut1, Method1, Relationship1]
#     return HttpResponse(json.dumps(results)) 



def search_term_exact(inPut):
    ''' 
    Search for the exact term - case insensitive
    '''
    try :
        umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
        cursor = umls.cursor()
        sql_select_query = "SELECT DISTINCT CUI, SAB, CODE, STR FROM MRCONSO WHERE STR = ?"
        ##sql_select_query_start = "SELECT DISTINCT CUI, SAB, CODE, STR FROM MRCONSO WHERE STR = ?"
        ##sql_select_query = sql_select_query_start + "INPUT STRING" maybe need this 
        ##cursor = umls.cursor()
        cursor.execute(sql_select_query, (inPut,))
        results = cursor.fetchall()

        CUIs = []
        SABs = []
        CODEs = []
        STRs = []
        tables =[]

        for row in results:
            CUI = row[0]
            SAB = row[1]
            CODE = row[2]
            STR = row[3]
            table = row[3] + ',' + row[0]
            CUIs += [CUI]
            SABs += [SAB]
            CODEs += [CODE]
            STRs += [STR]
            tables += [table]
                 
        umls.close()##close connection
        # print(CUIs)
        # print(SABs)
        # print(CODEs)
        # print(STRs)
        # print(results)
        # print(tables)
        return CUIs, SABs, CODEs, STRs, tables, results

    except sqlite3.Error as error:
        print("Error while conneting to sqlite", error)



def search_term_Relationship(inPut, Relationship):
    ''' 
    Search for terms with Relationship to searched term - case insensitive (not yet)
    '''
    try :
        umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
        cursor = umls.cursor()
        sql_select_query = """SELECT DISTINCT B.CUI2 as CUI, C.SAB, C.CODE, C.STR FROM MRCONSO A INNER JOIN MRREL B ON A.CUI = B.CUI1 INNER JOIN MRCONSO C ON B.CUI2 = C.CUI WHERE B.REL = ? AND A.STR = ?"""
        ##cursor = umls.cursor()
        cursor.execute(sql_select_query, (Relationship, inPut,))
        results = cursor.fetchall()

        CUIs = []
        SABs = []
        CODEs = []
        STRs = []
        tables =[]

        for row in results:
            CUI = row[0]
            SAB = row[1]
            CODE = row[2]
            STR = row[3]
            table = row[3] + ',' + row[0]
            CUIs += [CUI]
            SABs += [SAB]
            CODEs += [CODE]
            STRs += [STR]
            tables += [table]
        
        umls.close()##close connection
        # print(CUIs)
        # print(SABs)
        # print(CODEs)
        # print(STRs)
        # print(results)
        # print(tables)
        return CUIs, SABs, CODEs, STRs, tables, results

    except sqlite3.Error as error:
        print("Error while conneting to sqlite", error)


def search_cui(inPut):
    '''
    Input a CUI and search for all 
    '''
    try :
        umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
        cursor = umls.cursor()
        sql_select_query = """SELECT DISTINCT CUI, SAB, CODE, STR FROM MRCONSO WHERE CUI = ?"""
        ##cursor = umls.cursor()
        cursor.execute(sql_select_query, (inPut,))
        results = cursor.fetchall()

        CUIs = []
        SABs = []
        CODEs = []
        STRs = []
        tables =[]

        for row in results:
            CUI = row[0]
            SAB = row[1]
            CODE = row[2]
            STR = row[3]
            table = row[3] + ',' + row[0]
            CUIs += [CUI]
            SABs += [SAB]
            CODEs += [CODE]
            STRs += [STR]
            tables += [table]
        
        umls.close()##close connection
        # print(CUIs)
        # print(SABs)
        # print(CODEs)
        # print(STRs)
        # print(results)
        # print(tables)
        return CUIs, SABs, CODEs, STRs, tables, results

    except sqlite3.Error as error:
        print("Error while conneting to sqlite", error)


def search_not_cui(inPut):
    '''
    Input a (not CUI) code and search for all - 
    '''
    try :
        umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
        cursor = umls.cursor()
        sql_select_query = """SELECT DISTINCT CUI, SAB, CODE, STR FROM MRCONSO WHERE CODE = ?"""
        ##cursor = umls.cursor()
        cursor.execute(sql_select_query, (inPut,))
        results = cursor.fetchall()

        CUIs = []
        SABs = []
        CODEs = []
        STRs = []
        tables =[]

        for row in results:
            CUI = row[0]
            SAB = row[1]
            CODE = row[2]
            STR = row[3]
            table = row[3] + ',' + row[0]
            CUIs += [CUI]
            SABs += [SAB]
            CODEs += [CODE]
            STRs += [STR]
            tables += [table]
        
        # umls.close()##close connection
        # print(CUIs)
        # print(SABs)
        # print(CODEs)
        # print(STRs)
        # print(results)
        # print(tables)
        return CUIs, SABs, CODEs, STRs, tables, results

    except sqlite3.Error as error:
        print("Error while conneting to sqlite", error)



def search_cui_Relationship(inPut, Relationship):
    '''
    Input a (not CUI) code and search for all - 
    '''
    try :
        umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
        cursor = umls.cursor()
        sql_select_query = """SELECT DISTINCT B.CUI2 as CUI, C.SAB, C.CODE, C.STR FROM MRCONSO A INNER JOIN MRREL B ON A.CUI = B.CUI1 INNER JOIN MRCONSO C ON B.CUI2 = C.CUI WHERE B.REL = ? AND B.CUI1 = ?"""
        ##cursor = umls.cursor()
        cursor.execute(sql_select_query, (Relationship, inPut,))
        results = cursor.fetchall()

        CUIs = []
        SABs = []
        CODEs = []
        STRs = []
        tables =[]

        for row in results:
            CUI = row[0]
            SAB = row[1]
            CODE = row[2]
            STR = row[3]
            table = row[3] + ',' + row[0]
            CUIs += [CUI]
            SABs += [SAB]
            CODEs += [CODE]
            STRs += [STR]
            tables += [table]
        
        umls.close()##close connection
        # print(CUIs)
        # print(SABs)
        # print(CODEs)
        # print(STRs)
        # print(results)
        # print(tables)
        return CUIs, SABs, CODEs, STRs, tables, results

    except sqlite3.Error as error:
        print("Error while conneting to sqlite", error)



def search_code_Relationship(inPut, Relationship):
    '''
    Input a (not CUI) code and search for all - 
    '''
    try :
        umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
        cursor = umls.cursor()
        sql_select_query = """SELECT DISTINCT B.CUI2 as CUI, C.SAB, C.CODE, C.STR FROM MRCONSO A INNER JOIN MRREL B ON A.CUI = B.CUI1 INNER JOIN MRCONSO C ON B.CUI2 = C.CUI WHERE B.REL = ? AND A.STR = ?"""
        ##cursor = umls.cursor()
        cursor.execute(sql_select_query, (Relationship, inPut,))
        # print(results)
        # print(table)
        results = cursor.fetchall()

        CUIs = []
        SABs = []
        CODEs = []
        STRs = []
        tables =[]

        for row in results:
            CUI = row[0]
            SAB = row[1]
            CODE = row[2]
            STR = row[3]
            table = row[3] + ',' + row[0]
            CUIs += [CUI]
            SABs += [SAB]
            CODEs += [CODE]
            STRs += [STR]
            tables += [table]
        
        umls.close()##close connection
        # print(CUIs)
        # print(SABs)
        # print(CODEs)
        # print(STRs)
        # print(results)
        # print(tables)
        return CUIs, SABs, CODEs, STRs, tables, results

    except sqlite3.Error as error:
        print("Error while conneting to sqlite", error)


# ToDo add this as an option on the data gen page

# def custom_query(inPut):
#     '''
#     create a custom query ### Not sure about this one
#     '''
#     try :
#         umls = sqlite3.connect(umls_path + 'umlsbrowser.sqlite')
#         cursor = umls.cursor()
#         sql_select_query = QUERY
#         ##cursor = umls.cursor()
#         cursor.execute(sql_select_query)
#         results = cursor.fetchall()

#         for row in results:
#             return row
        
#         umls.close()##close connection
#         return row

#     except sqlite3.Error as error:
#         print("Error while conneting to sqlite", error)

#     finally:
#         if (umls):
#             umls.close()



def search_umls(request):
    '''
    Search UMLS for the selected Term/CUI/Code
    '''
    Relationship = request.POST['Relationship']
    Method = request.POST['Method']
    inPut = request.POST['input']
    
    if Relationship == 'exact':
        if Method == 'String':
            CUI, SAB, CODE, STR, table, results = search_term_exact(inPut)
        elif Method == 'CUI':
            CUI, SAB, CODE, STR, table, results = search_cui(inPut)
        else:
            CUI, SAB, CODE, STR, table, results = search_not_cui(inPut)
    else:
        if Method == 'String':
            CUI, SAB, CODE, STR, table, results = search_term_Relationship(inPut, Relationship)
        elif Method == 'CODE':
            CUI, SAB, CODE, STR, table, results = search_code_Relationship(inPut, Relationship)
        else:
            CUI, SAB, CODE, STR, table, results = search_cui_Relationship(inPut, Relationship)
    # print(type(results))
    # print(results)
    # Result is list of tuples
    # print(table)
    # print(Relationship)
    # print(Method)
    # print(inPut)
    return HttpResponse(json.dumps(results))
    

