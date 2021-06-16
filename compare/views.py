from django.shortcuts import render
import re
import operator
from deepdiff import DeepDiff
from django.http import HttpResponse
import json
from collections import defaultdict

def compare(request):
    return render(request, 'compare.html', {})

def inter_annotator_agreement(request):
    return render(request, 'inter_annotator_agreement.html', {})


def annFiletoArray(annFile):
    '''
    Splits ann file into array with each annotation having one value in the array
    '''
    array = re.split('(T[0-9]{1,3}\t)', annFile) # Split on T2 TAB for start of annotations - and keep what spliting on 
    array.pop(0) # Spilt right at start so first is blank therefore remove
    array = [ x+y for x,y in zip(array[0::2], array[1::2]) ] #join every two elements together (spliting separates them so this repairs that)
    return array
    

def dicAnnotations(annFile):
    '''
    Creates dictionary of dictionary with letters annotations and features in it
    '''
    letterDictionary = {} # create empty dictionary
    for idx, annotations in enumerate(annFile): # enumerate annfile and loop though it
        features = re.split('\n', annotations) # split by \n to get features from each annotation
        if features[-1] == '': # if last feature is blank delete it
            features.pop(-1) # old ann file had empty line at end, not sure if something from old markup or if still occurs from time to time
        i = 0
        annDictionary = {} # dictionary for the annotation
        while i < len(features):
            values =  re.split('\t| ', features[i]) # spilt on tab or space
            if i == 0: # first features will be one with name of annotation + start end point
                annotation = values[1]# name of annotation
                start =  values[2]# start index
                end =  values[3]# end index
                string = values[4]# highlighted string
                annDictionary["AnnotationName"] = annotation #push to annDictionary
                annDictionary["Start"] = start
                annDictionary["End"] = end
                annDictionary["String"] = string
            else: # all others will have features and values
                attribute = values[1] 
                value = values[3]
                annDictionary[attribute] = value
            i += 1 # go to next attribute
        annotaionNum = 'Annotation' + str(idx) #number of the annotaion in the letter (Zero Indexed)
        letterDictionary[annotaionNum] = annDictionary # add annotation to letter Dictionary + then do it all again for next annotation
    return letterDictionary # return the letterDictionary (dictionary of dictionaries)


def SortAnnDictionary(annDic):
    '''
    Sort annotaton dictionary and extract (plus remove) start, end and annotation Name.
    '''
    copyDic = annDic.copy() #copy beacuse otherwise removing from one will remove from other also
    annName = annDic.get('AnnotationName') 
    annStart = int(annDic.get('Start'))
    annEnd = int(annDic.get('End'))
    annString = annDic.get('String')
    copyDic.pop("AnnotationName")
    copyDic.pop("Start")
    copyDic.pop("End")
    copyDic.pop("String")
    copyDic = dict(sorted(copyDic.items(), key=operator.itemgetter(0)))
    return annName, annStart, annEnd, annString, copyDic


def annotations_match(Dic1, Dic2):
    '''
    Get the annotations the have the same name and that overlap (start point of one between start and end of other).
    Will only get annotations from Dic 1, needs to be rerun for annotations from Dic 2 (swap the inputs).
    '''
    matchedDic = {}
    for annNumber, PreannDic in Dic1.items(): 
        annName1, annStart1, annEnd1, annString1, annDic1 = SortAnnDictionary(PreannDic)
        for annNumber2, PreannDic2 in Dic2.items():
            annName2, annStart2, annEnd2, annString2, annDic2 = SortAnnDictionary(PreannDic2)
            if annName1 == annName2: ## If names of annotations are the same
                if (annStart1 >= annStart2 and annStart1 <= annEnd2) or (annStart2 >= annStart1 and annStart2 <= annEnd1): ## and if start 1 between start2 and end 2 or vice versa 
                    matchedDic[annNumber] = PreannDic ## add annotation to the matched output
                    break
    return matchedDic


def unmatched_annotations(matched, original):
    '''
    Get annotations that haven't matched from the original dictionary
    '''
    unmatchedDic = {}
    for annNumber, PreannDic in original.items():
        if annNumber not in matched: ## if annNumber isn't in matched set then it isn't a match so add to unmatched.....
            unmatchedDic[annNumber] = PreannDic
    return unmatchedDic


def sameNumFeatures (dicA, dicB):
    '''
    Gets annotations with the same number of features
    Doesn't check name of features or values
    '''
    sameNumFeatures = {}
    for annNumber, PreannDic in dicA.items(): 
        annName1, annStart1, annEnd1, annString1, annDic1 = SortAnnDictionary(PreannDic)
        for annNumber2, PreannDic2 in dicB.items():
            annName2, annStart2, annEnd2, annString2, annDic2 = SortAnnDictionary(PreannDic2)
            if annName1 == annName2: 
                if (annStart1 >= annStart2 and annStart1 <= annEnd2) or (annStart2 >= annStart1 and annStart2 <= annEnd1): #start 1 between start2 and end 2 or vice versa
                    if len(annDic1) == len(annDic2):## if they have the same number of features for annotation then can be outputted
                        sameNumFeatures[annNumber] = PreannDic
    return sameNumFeatures


def differentNumFeatures (samenumberFeatures, original):
    '''
    Gets annotations with different number of features (therefore not a match)
    '''
    differentNumFeatures = {}
    for annNumber, PreannDic in samenumberFeatures.items():
        if annNumber not in original:## if not in sameNumFeatures then doesn't have same number and therefore can't be a match
            differentNumFeatures[annNumber] = PreannDic
    return differentNumFeatures


def sameEverything(dicA, dicB):
    '''
    Gets annotations that have all features with same name and values
    '''
    sameEverything = {}
    for annNumber, PreannDic in dicA.items(): 
        annName1, annStart1, annEnd1, annString1, annDic1 = SortAnnDictionary(PreannDic)
        for annNumber2, PreannDic2 in dicB.items():
            annName2, annStart2, annEnd2, annString2, annDic2 = SortAnnDictionary(PreannDic2)
            if annName1 == annName2: 
                if (annStart1 >= annStart2 and annStart1 <= annEnd2) or (annStart2 >= annStart1 and annStart2 <= annEnd1): #start 1 between start2 and end 2 or vice versa
                    if annDic1 == annDic2:## If the dictionaries are idential then its a match
                        sameEverything[annNumber] = PreannDic
    return sameEverything


def differentFeatures (sameeverything, original):
    '''
    Gets annotations with different features (therefore not a match)
    '''
    differentFeatures = {}
    for annNumber, PreannDic in sameeverything.items():
        if annNumber not in original:## if not in sameNumFeatures then doesn't have same number and therefore can't be a match
            differentFeatures[annNumber] = PreannDic
    return differentFeatures


## this will be used to look at only different annotations in markup
def dicToAnnFile(dic):
    '''
    Returns the dictionary back to an .ann file
    '''
    annFile = "" # Ann file starts empty
    T = 1 #First Annotaion gets T1
    A = 1 # First feature will be A1
    for annNumber, PreannDic in dic.items(): 
        annName1, annStart1, annEnd1, annString1, annDic1 = SortAnnDictionary(PreannDic)
        annFile = annFile + "T" + str(T) + "\t" + annName1 + " " + str(annStart1) + " " + str(annEnd1) + "\t" + annString1 + "\n" ## Creates the line for the annotation
        for feature, value in annDic1.items():
            annFile = annFile + "A" + str(A) + "\t" + feature + " " + "T" + str(T) + " " + value + "\n" ## Creates lines for the features of the annotations above
            A = A + 1
        T = T + 1
    return annFile


def precision(TP, FP):
    '''
    Calculate Precision
    '''
    if TP == 0 and FP == 0:
        precision1 = "N/A"
    else:
        precision1 = TP / (TP+FP)
    return round(precision1,4)


def recall(TP, FN):
    '''
    Calculate Recall
    '''
    if TP == 0 and FN == 0:
        recall1 = "N/A"
    else:
        recall1 = TP / (TP+FN)
    return round(recall1,4)


def f1Score(precision, recall):
    '''
    Calculate f1Score
    '''
    if precision == 0 or recall == 0:
        f1Score1 = 0.0
    elif precision == "N/A" or recall == "N/A":
        f1Score1 = "N/A"
    else :
        f1Score1 = (2 * precision * recall)/(precision + recall)
    return round(f1Score1,4)


def get_annotations(Dic1, Dic2):
    '''
    Get the annotation names of the annotations in the letter. 
    '''
    annotations = set()
    for annNumber, PreannDic in Dic1.items(): 
        annName1, annStart1, annEnd1, annString1, annDic1 = SortAnnDictionary(PreannDic)
        annotations.add(annName1)
    for annNumber2, PreannDic2 in Dic2.items():
        annName2, annStart2, annEnd2, annString2, annDic2 = SortAnnDictionary(PreannDic2)
        annotations.add(annName2)
    return annotations


def annotation_unique_dictionaries (annotations, Dic1, Dic2):
    '''
    Creates Dictionaries of lists of Dictionaries that are separated by letter (a or b) and annotation name
    '''
    Let1Dic = {}
    Let2Dic = {}
    for annots in annotations:
        listAnnots1 = {}
        listAnnots2 = {}
        for annNumber, PreannDic in Dic1.items():
            annName1, annStart1, annEnd1, annString1, annDic1 = SortAnnDictionary(PreannDic)
            if annots == annName1:
                listAnnots1[annNumber] = PreannDic
        for annNumber2, PreannDic2 in Dic2.items():
            annName2, annStart2, annEnd2, annString2, annDic2 = SortAnnDictionary(PreannDic2)
            if annots == annName2:
                listAnnots2[annNumber2] = PreannDic2
        Let1Dic.update({annots:listAnnots1})
        Let2Dic.update({annots:listAnnots2})
    return Let1Dic, Let2Dic


def get_f1score_per_annotation(annotationSet, let1dic, let2dic):
    for annotation in annotationSet:
        annotation2 = let1dic.get(annotation)
        annotation3 = let2dic.get(annotation)
        print(annotation)
        #print(annotation2)
        #print(annotation3)
        ## print(annotation2, "\n",annotation3)
        results, TP, FN, FP  = runEverything123(annotation2, annotation3)
        print(results)
        print(TP, FN, FP)


def runAll(annFile1, annFile2):
    '''
    Run all the functions to create the output
    Output is the precision, recall and f1Score for one letter that is run
    '''
    ## Can't work out why some are windows end and others aren't, this is a easy fix
    annFile1 = annFile1.replace('\r\n', '\n') 
    annFile2 = annFile2.replace('\r\n', '\n')
    
    ## Create the original dictionary from .ann file
    letterDic = dicAnnotations(annFiletoArray(annFile1))
    letterDic2 = dicAnnotations(annFiletoArray(annFile2))

    ## Get annotations the match with eachother (match = same name + overlap)
    matchedDic1 = annotations_match(letterDic, letterDic2)
    matchedDic2 = annotations_match(letterDic2, letterDic)

    ## Annotations with no match
    unmatchedDic1 = unmatched_annotations(matchedDic1, letterDic)
    unmatchedDic2 = unmatched_annotations(matchedDic2, letterDic2)

    ## Annotations with same number of features
    sameNumberofFeatues1 = sameNumFeatures(matchedDic1, matchedDic2)
    sameNumberofFeatues2 = sameNumFeatures(matchedDic2, matchedDic1)

    ## Annotations with different number of features, therefore, not a match.
    differentNumberoffeatures1 = differentNumFeatures(matchedDic1, sameNumberofFeatues1)
    differentNumberoffeatures2 = differentNumFeatures(matchedDic2, sameNumberofFeatues2)

    ## Annotations that are identical
    sameEverything1 = sameEverything(sameNumberofFeatues1, sameNumberofFeatues2)
    sameEverything2 = sameEverything(sameNumberofFeatues2, sameNumberofFeatues1)

    ## Annotations that have different features or values for the features, therefore, not a match.
    differentFeatures1 = differentFeatures(sameNumberofFeatues1, sameEverything1)
    differentFeatures2 = differentFeatures(sameNumberofFeatues2, sameEverything2)

    ## All the annotations that are different 
    differentAnnotations = {}
    differentAnnotations.update(unmatchedDic1) #add unmatchedDic = not same name and overlapping
    differentAnnotations.update(differentNumberoffeatures1) ## diferent number of features 
    differentAnnotations.update(differentFeatures1) ## features are different in someway (name or value)

    ## All the annotaitons that are different
    differentAnnotations2 = {}
    differentAnnotations2.update(unmatchedDic2)
    differentAnnotations2.update(differentNumberoffeatures2)
    differentAnnotations2.update(differentFeatures2)

    if len(sameEverything1) == len(sameEverything2):
        TP = len(sameEverything1)
    elif len(sameEverything1) < len(sameEverything2):
        TP = len(sameEverything1)
    else:
        TP = len(sameEverything2)


    FP = len(letterDic2) - TP ## False Positives = number of annotaions that are only in second set i.e. length of second set - length of TP
    FN = len(letterDic) - TP ## False Negatives = number of annotaions that are only in first set i.e. length of first set - length of TP


    if len(letterDic) > 0 and len(letterDic2) > 0: ##
        precision1 = precision(TP, FP)
        recall1 = recall(TP, FN)
    else:
        precision1 = 0
        recall1 = 0

    f1Score1 = f1Score(precision1, recall1)


    results = [precision1, recall1, f1Score1]
    # return precision1, recall1, f1Score1
    return results


def runAll2(letterDic, letterDic2):
    '''
    Run all the functions to create the output
    Output is the precision, recall and f1Score for one letter that is run
    Different input than runAll()
    '''
    ## Get annotations the match with eachother (match = same name + overlap)
    matchedDic1 = annotations_match(letterDic, letterDic2)
    matchedDic2 = annotations_match(letterDic2, letterDic)

    ## Annotations with no match
    unmatchedDic1 = unmatched_annotations(matchedDic1, letterDic)
    unmatchedDic2 = unmatched_annotations(matchedDic2, letterDic2)

    ## Annotations with same number of features
    sameNumberofFeatues1 = sameNumFeatures(matchedDic1, matchedDic2)
    sameNumberofFeatues2 = sameNumFeatures(matchedDic2, matchedDic1)

    ## Annotations with different number of features, therefore, not a match.
    differentNumberoffeatures1 = differentNumFeatures(matchedDic1, sameNumberofFeatues1)
    differentNumberoffeatures2 = differentNumFeatures(matchedDic2, sameNumberofFeatues2)

    ## Annotations that are identical
    sameEverything1 = sameEverything(sameNumberofFeatues1, sameNumberofFeatues2)
    sameEverything2 = sameEverything(sameNumberofFeatues2, sameNumberofFeatues1)

    ## Annotations that have different features or values for the features, therefore, not a match.
    differentFeatures1 = differentFeatures(sameNumberofFeatues1, sameEverything1)
    differentFeatures2 = differentFeatures(sameNumberofFeatues2, sameEverything2)

    ## All the annotations that are different 
    differentAnnotations = {}
    differentAnnotations.update(unmatchedDic1) #add unmatchedDic = not same name and overlapping
    differentAnnotations.update(differentNumberoffeatures1) ## diferent number of features 
    differentAnnotations.update(differentFeatures1) ## features are different in someway (name or value)

    ## All the annotaitons that are different
    differentAnnotations2 = {}
    differentAnnotations2.update(unmatchedDic2)
    differentAnnotations2.update(differentNumberoffeatures2)
    differentAnnotations2.update(differentFeatures2)

    if len(sameEverything1) == len(sameEverything2):
        TP = len(sameEverything1)
    elif len(sameEverything1) < len(sameEverything2):
        TP = len(sameEverything1)
    else:
        TP = len(sameEverything2)


    FP = len(letterDic2) - TP ## False Positives = number of annotaions that are only in second set i.e. length of second set - length of TP
    FN = len(letterDic) - TP ## False Negatives = number of annotaions that are only in first set i.e. length of first set - length of TP


    if len(letterDic) > 0 and len(letterDic2) > 0: ##
        precision1 = precision(TP, FP)
        recall1 = recall(TP, FN)
    else:
        precision1 = 0
        recall1 = 0

    f1Score1 = f1Score(precision1, recall1)


    results = [precision1, recall1, f1Score1]
    # return precision1, recall1, f1Score1
    return results


def runEverything(request):
    '''
    Run all the functions to create the  precision, recall and f1Score for one letter that is run
    '''
    annFile1 = request.POST['ann1']
    annFile2 = request.POST['ann2']
    ## Can't work out why some are windows end and others aren't, this is a easy fix
    results = runAll(annFile1, annFile2)
    # return precision1, recall1, f1Score1
    return HttpResponse(json.dumps(results))


def runEverything2(request):
    '''
    Run all the functions to create the average f1score for the corpus
    '''
    annFiles1 = request.POST.getlist('annFiles1[]')
    annFiles2 = request.POST.getlist('annFiles2[]')

    overallF1 = []

    for index, x in enumerate(annFiles1):
        annf1 = x
        annf2 = annFiles2[index]
        if (annf1 == "" or annf2 == ""):
            overallF1.append("N/A")
        else :
            results123 = runAll(annf1, annf2)
            overallF1.append(results123[2])


    noNull = [x for x in overallF1 if x != "N/A"]
    average = round(sum(noNull)/len(noNull),4)
    output = [overallF1, average]
    return HttpResponse(json.dumps(output))


def get_results_each_letter(request):
    '''
    Run all the functions to get f1score, precision + recall for each letter in the corpus
    '''
    annFiles1 = request.POST.getlist('annFiles1[]')
    annFiles2 = request.POST.getlist('annFiles2[]')

    overall = {}

    for index, x in enumerate(annFiles1):
        annf1 = x
        annf2 = annFiles2[index]
        if (annf1 == "" or annf2 == ""):
            overall[index] = "N/A"
        else :
            results123 = runAll(annf1, annf2)
            overall[index] = results123

    return HttpResponse(json.dumps(overall)) 


def get_f1score_per_annotation(request):

    annFile1 = request.POST['ann1']
    annFile2 = request.POST['ann2']

    annFile1 = annFile1.replace('\r\n', '\n') 
    annFile2 = annFile2.replace('\r\n', '\n')
    
    ## Create the original dictionary from .ann file
    letterDic = dicAnnotations(annFiletoArray(annFile1))
    letterDic2 = dicAnnotations(annFiletoArray(annFile2))

    annotationSet = get_annotations(letterDic, letterDic2)

    Let1Dic, Let2Dic = annotation_unique_dictionaries(annotationSet, letterDic, letterDic2)

    output = {}

    for annotation in annotationSet:
        annotation2 = let1dic.get(annotation)
        annotation3 = let2dic.get(annotation)
        print(annotation)
        #print(annotation2)
        #print(annotation3)
        ## print(annotation2, "\n",annotation3)
        results = runAll2(annotation2, annotation3)
        output[annotation] = results
    return HttpResponse(json.dumps(output))


def get_f1score_per_annotationCorpus(request):

    annFiles1 = request.POST.getlist('annFiles1[]')
    annFiles2 = request.POST.getlist('annFiles2[]')
    LetterNames = request.POST.getlist('letterNames[]')

    overallF1perAnnotation = {}

    for index, x in enumerate(annFiles1):
        annf1 = x
        annf2 = annFiles2[index]
        if (annf1 == "" or annf2 == ""):
            overallF1perAnnotation[index] = "N/A"
        else :
            annf1 = annf1.replace('\r\n', '\n') 
            annf2 = annf2.replace('\r\n', '\n')
            
            ## Create the original dictionary from .ann file
            letterDic = dicAnnotations(annFiletoArray(annf1))
            letterDic2 = dicAnnotations(annFiletoArray(annf2))

            annotationSet = get_annotations(letterDic, letterDic2)

            let1Dic, let2Dic = annotation_unique_dictionaries(annotationSet, letterDic, letterDic2)

            output = {}

            for annotation in annotationSet:
                annotation2 = let1Dic.get(annotation)
                annotation3 = let2Dic.get(annotation)
                results = runAll2(annotation2, annotation3)
                output[annotation] = results

            overallF1perAnnotation[index] = output

    ## Convert Results into HTML table format
    ## Do in the for loop I think - so can get table with names of the letter 
    ## and then all the appropriate features (alphabetical order?)

    return HttpResponse(json.dumps(overallF1perAnnotation))


def get_f1score_per_annotationCorpusHTML(request):

    annFiles1 = request.POST.getlist('annFiles1[]')
    annFiles2 = request.POST.getlist('annFiles2[]')
    LetterNames = request.POST.getlist('letterNames[]')

    output = defaultdict(list)

    html = "<style> table, th, td {border: 1px solid black;border-collapse: collapse;margin: 5px;}</style>"
    htmlTable1 = "<table><tr><th>LetterNames</th><th>Annotation</th><th>F1Score</th></tr>"

    overallF1perAnnotation = {}

    for index, x in enumerate(annFiles1):
        annf1 = x
        annf2 = annFiles2[index]
        # LetterName = annNames[index]
        if (annf1 == "" or annf2 == ""):
            overallF1perAnnotation[index] = "N/A"
        else :
            annf1 = annf1.replace('\r\n', '\n') 
            annf2 = annf2.replace('\r\n', '\n')
            
            ## Create the original dictionary from .ann file
            letterDic = dicAnnotations(annFiletoArray(annf1))
            letterDic2 = dicAnnotations(annFiletoArray(annf2))

            annotationSet = get_annotations(letterDic, letterDic2)

            annotationSet = list(annotationSet)

            annotationSet.sort()

            let1Dic, let2Dic = annotation_unique_dictionaries(annotationSet, letterDic, letterDic2)

            for annotation in annotationSet:
                if annotation in output:
                    annotation2 = let1Dic.get(annotation)
                    annotation3 = let2Dic.get(annotation)
                    results3 = runAll2(annotation2, annotation3)
                    f1 = results3[2]
                    output[annotation].append(f1)
                    
                else:
                    annotation2 = let1Dic.get(annotation)
                    annotation3 = let2Dic.get(annotation)
                    results2 = runAll2(annotation2, annotation3)
                    f1 = results2[2]
                    output[annotation] = [f1]


            colspan = len(annotationSet)

            for i, annotation in enumerate(annotationSet):
                annotation2 = let1Dic.get(annotation)
                annotation3 = let2Dic.get(annotation)
                results = runAll2(annotation2, annotation3)
                ##output[annotation] = results
                if (i==0):
                    htmlAnnotation = "<tr>\n<th scope='row' rowspan = "+ str(colspan) + ">" + LetterNames[index] + "</th>\n<td>"+ annotation +"</td>\n<td>"+ str(results[2]) +"</td>\n</tr>"
                else:
                    htmlAnnotation = htmlAnnotation + "\n<tr>\n<td>" + annotation +"</td>\n<td>" + str(results[2]) +"</td>\n</tr>"

            
        htmlTable1 = htmlTable1 + "\n" + htmlAnnotation

    htmlTable1 = htmlTable1 + "</table>" 

    avgF1perAnnot = {}

    for annotation in output:
        annotationAVG = round(sum(output[annotation])/len(output[annotation]),4)
        avgF1perAnnot[annotation] = annotationAVG

    annotationAVGSorted = {}

    for i in sorted(avgF1perAnnot):
        annotationAVGSorted[i] = avgF1perAnnot[i]

    htmlOverall = "<table><tr><th>Annotation</th><th>F1Score</th></tr>"
    htmlOverallRow = ""

    for annotation, f1S in annotationAVGSorted.items():
            htmlOverallRow = htmlOverallRow + "<tr>\n<td>"+ annotation +"</td>\n<td>"+ str(f1S) +"</td>\n</tr>\n"

    htmlOverallRow = htmlOverallRow[:-1]

    htmlTable2 = htmlOverall + "\n" + htmlOverallRow + "</table>"
                       
    

    html = html + htmlTable2 + htmlTable1
    return HttpResponse(json.dumps(html))