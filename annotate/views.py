import json
import pickle
import requests
import stringdist

from django.http import HttpResponse
from django.shortcuts import render

from nltk import sent_tokenize
from nltk import word_tokenize
from nltk import ngrams

from simstring.feature_extractor.character_ngram import (
    CharacterNgramFeatureExtractor)
from simstring.database.dict import DictDatabase
from simstring.measure.cosine import CosineMeasure
from simstring.searcher import Searcher


def annotate_data(request):
    return render(request, 'annotate/annotate.html', {})


def suggest_cui(request):
    """
    Returns all relevant UMLS matches that have a cosine similarity
    value over the specified threshold, in descending order
    """
    global searcher
    if searcher is None:
        return HttpResponse('')

    selected_term = request.GET['selectedTerm']

    # Weight relevant UMLS matches based on word ordering
    weighted_outputs = {}
    for umls_match in searcher.ranked_search(selected_term, COSINE_THRESHOLD):
        umls_term = umls_match[1]
        # Add divsor to each term
        weighted_outputs[umls_term + ' :: UMLS ' + term_to_cui[umls_term] + '***'] = stringdist.levenshtein(umls_term, selected_term)

    # Sort order matches will be displayed based on weights
    output = [i[0] for i in sorted(weighted_outputs.items(), key=lambda kv: kv[1])]

    # Remove divisor from final term
    if output != []:
        output[-1] = output[-1][:-3]

    return HttpResponse(output)


def setup_dictionary(request):
    """
    Setup user-specified dictionary to be used for
    phrase approximation
    """
    dictionary_selection = request.POST['dictionarySelection']
    global term_to_cui
    global searcher
    if dictionary_selection == 'umlsDictionary':
        # searcher = umls_searcher
        pass
    elif dictionary_selection == 'noDictionary':
        # searcher = None
        pass
    elif dictionary_selection == 'userDictionary':
        json_data = json.loads(request.POST['dictionaryData'])
        db = DictDatabase(CharacterNgramFeatureExtractor(2))
        term_to_cui = {}
        for row in json_data:
            values = row.split('\t')
            if len(values) == 2:
                term_to_cui[values[1]] = values[0]
        for value in term_to_cui.keys():
            value = clean_dictionary_term(value)
            db.add(value)
        searcher = Searcher(db, CosineMeasure())
    return HttpResponse(None)


def clean_dictionary_term(value):
    return value.lower()


'''
def auto_annotate(request):
    doc_text = request.GET['document_text']

    doc_ngrams = []
    for sentence in sent_tokenize(doc_text):
        tokens = sentence.split()
        token_count = len(tokens)
        if token_count > 2:
            token_count = 3

        for n in range(2, token_count):
            for ngram in ngrams(tokens, n):
                term = ' '.join(list(ngram))
                if term not in doc_ngrams:
                    doc_ngrams.append(term)

    raw_sentence_ngrams = []
    clean_sentence_ngrams = []
    for raw_ngram in doc_ngrams:
        if not raw_ngram[-1].isalnum():
            raw_ngram = raw_ngram[:-1]
        else:
            continue

        clean_ngram = ''
        for char in raw_ngram:
            if char.isalnum():
                clean_ngram += char.lower()
            else:
                clean_ngram += ' '
        clean_ngram = ' '.join([word for word in clean_ngram.split()])
        if clean_ngram is not '':
            raw_sentence_ngrams.append(raw_ngram)
            clean_sentence_ngrams.append(clean_ngram)

    final_results = []
    for i in range(len(raw_sentence_ngrams)):
        result = searcher.ranked_search(raw_sentence_ngrams[i].lower(),
                                        COSINE_THRESHOLD + 0.2)
        if result == []:
            continue
        else:
            final_results.append([raw_sentence_ngrams[i]] + [result[0][1]] +
                                 [term_to_cui[result[0][1]]])

    return HttpResponse(json.dumps(final_results))


def load_user_dictionary(request, data_file_path):
    try:
        chosen_file = gui.PopupGetFile('Choose a file', no_window=True)
    except:
        return HttpResponse(None)

    # Read in tab-delimited UMLS file in form of (CUI/tTERM)
    user_dict = open(chosen_file).read().split('\n')

    # Split tab-delimited UMLS file into seperate lists of cuis and terms
    cui_list = []
    term_list = []

    for row in user_dict:
        data = row.split('\t')
        if len(data) > 1:
            cui_list.append(data[0])
            term_list.append(data[1])

    global term_to_cui
    global db
    global searcher

    # Map cleaned UMLS term to its original
    term_to_cui = dict()

    for i in range(len(term_list)):
        term_to_cui[term_list[i]] = cui_list[i]

    # Create simstring model
    db = DictDatabase(CharacterNgramFeatureExtractor(2))

    for term in term_list:
        db.add(term)

    searcher = Searcher(db, CosineMeasure())
    return HttpResponse(None)

'''



# Imports
import random
import numpy as np
from os import listdir
from os.path import isfile, join, splitext
from nltk import ngrams
from modAL.models import ActiveLearner
from modAL.uncertainty import uncertainty_sampling
from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer

# Get training data
def get_training_data(txt_files, ann_files, custom_dict=None):
    # Get all annotated texts from ann_files (positive samples)
    annotated = set()
    for ann_file in ann_files:
        annotations = ann_file.split('\n')
        for annotation in annotations:
            if len(annotation) > 0 and annotation[0] == 'T':
                raw_annotation_text = annotation.split('\t')[-1]
                # MOST ANNOTATION SPACES PROBABLY HAVEN'T BEEN REPLACED WITH '_'
                annotated.add(' '.join(raw_annotation_text.split('_')).lower().strip())

    '''
    # Get all annotated texts from custom_dict (positive samples)
    for term in custom_dict:
        annotated.add(term)
    '''

    # Get all unannotated texts from txt_files (negative samples)
    not_annotated = set()
    for txt_file in txt_files:
        sentences = txt_file.split('\n')
        for sentence in sentences:
            # NGRAM RANGE IS LIMITED TO 4
            for n in range(4):
                for ngram in ngrams(sentence.split(' '), n):
                    term = ' '.join(ngram).lower().strip()
                    if term not in annotated:
                        not_annotated.add(term)

    # These are split to make them equal length -- CHANGE OR LIMIT TO CERTAIN NUMBER OF SAMPLES --
    annotated_count = len(list(annotated))
    X = list(annotated) + list(not_annotated)[:annotated_count]
    y = [1 for _ in range(annotated_count)] + [0 for _ in range(annotated_count)]

    return X, y


# Encode training data
def encode_data(X, y=None):
    X = vectorizer.fit_transform(X).toarray()
    
    if y is None:
        return np.array(X)
    
    # Shuffle all data - MAY NOT BE NESECESSARY IF ONLY USED FOR TRAINING
    Xy = list(zip(X, y))
    random.shuffle(Xy)
    X, y = zip(*Xy)
    return np.array(X), np.array(y)


# Initialise learner
def initialise_active_learner(request):
    txt_files = request.POST.get('txtFiles')
    ann_files = request.POST.get('annFiles')
    # Add custom dict

    X_train, y_train = get_training_data([txt_files], [ann_files])
    X_train, y_train = encode_data(X_train, y_train)

    # Initialise the learner - CHANG ENUMBER OF ESTIMATORS, CLASSIFIER, QUERY STRATERGY, ETC.
    learner = ActiveLearner(
        estimator=RandomForestClassifier(n_estimators=100),
        query_strategy=uncertainty_sampling,
        X_training=X_train, y_training=y_train
    )

    return HttpResponse(None)


def get_annotation_suggestions(request):
    txt_file = request.POST.get('txtFile')
    ngrams = get_ngram_data(txt_file)
    X = vectorizer.transform(ngrams)

    prediction_labels = predict_labels(X)
    prediction_terms = []
    ngrams = list(ngrams)
    for i in range(len(predictions)):
        if predictions[i] == 1:
            prediction_terms.append(ngrams[i])

    # Pass back the id, get a response and return before teaching? Loop through and get all ids, or top n ids
    prediction_terms.append(query_data(X))

    return HttpResponse(prediction_terms)


# Get n-gram data
def get_ngram_data(txt_file):
    # Get all possible ngrams from letter currently being annotated
    potential_annotations = set()

    sentences = txt_file.split('\n')
    for sentence in sentences:
        # NGRAM RANGE IS LIMITED TO 4
        for n in range(4):
            for ngram in ngrams(sentence.split(' '), n):
                potential_annotations.add(' '.join(ngram).lower().strip())
    
    return potential_annotations


# Query n-gram data (have a category for unsure to help improve & category of confident labels)
def query_data(X):
    n_queries = 10
    for idx in range(n_queries):
        query_idx, query_instance = learner.query(X)
    return query_instance
    #learner.teach(X_train_2[query_idx], y_train_2[query_idx])


# Predict labels for n-gram data
def predict_labels(X):
    return learner.predict(X)


# Acceptance or rejection made
def suggestion_feedback():
    learner.teach("encoded text", "label")


# Non-suggested annotation made
def annotation_added():
    learner.teach("encoded text", 1)


# Refresh suggestions (each time a acceptance, rejection or non-suggested annotation added)



vectorizer = CountVectorizer()
learner = None
COSINE_THRESHOLD = 0.7

TEST = True

if TEST:
    term_to_cui = None
    db = None
    searcher = None
else:
    term_to_cui = pickle.load(open('term_to_cui.pickle', 'rb'))
    db = pickle.load(open('db.pickle', 'rb'))
    searcher = Searcher(db, CosineMeasure())