import json
import pickle
import random
import requests
import stringdist
import numpy as np

from django.http import HttpResponse
from django.shortcuts import render

from modAL.models import ActiveLearner
from modAL.uncertainty import uncertainty_sampling

from nltk import sent_tokenize
from nltk import word_tokenize
from nltk import ngrams

from os import listdir
from os.path import isfile, join, splitext

from simstring.feature_extractor.character_ngram import (
    CharacterNgramFeatureExtractor)
from simstring.database.dict import DictDatabase
from simstring.measure.cosine import CosineMeasure
from simstring.searcher import Searcher

from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer


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


# Get all annotated texts from ann_files (positive samples)
def get_annotated_texts(ann_files):
    annotated = set()
    for ann_file in ann_files:
        annotations = ann_file.split('\n')
        for annotation in annotations:
            if len(annotation.strip()) > 0 and annotation[0] == 'T':
                raw_annotation_text = annotation.split('\t')[-1]
                # MOST ANNOTATION SPACES PROBABLY HAVEN'T BEEN REPLACED WITH '_'
                annotated.add(' '.join(raw_annotation_text.split('_')).lower().strip())
    return annotated


# Get all unannotated texts from txt_files (negative samples)
def get_unannotated_texts(txt_files, annotated):
    unannotated = set()
    for txt_file in txt_files:
        ngrams = get_ngram_data(txt_file)
        for ngram in ngrams:
            if ngram not in annotated:
                unannotated.add(ngram)
    return unannotated


# Get training data
def get_training_data(txt_files, ann_files, custom_dict=None):
    # Get all annotated texts from ann_files (positive samples)
    annotated = get_annotated_texts(ann_files)

    # Get all unannotated terms (negative samples)
    unannotated = get_unannotated_texts(txt_files, annotated)

    # Currently split to make equal length -- CHANGE OR LIMIT TO CERTAIN NUMBER OF SAMPLES --
    annotated_count = len(list(annotated))
    X = list(annotated) + list(unannotated)[:annotated_count]
    y = [1 for _ in range(annotated_count)] + [0 for _ in range(annotated_count)]

    # Shuffle all data - MAY NOT BE NESECESSARY IF ONLY USED FOR TRAINING
    Xy = list(zip(X, y))
    random.shuffle(Xy)
    X, y = zip(*Xy)

    return X, y


# Encode training data
def encode_training_data(X, y):
    # ENCODE AS N-CHARS
    global vectorizer
    X = vectorizer.fit_transform(X).toarray()
    return np.array(X), np.array(y)


# Initialise learner
def initialise_active_learner(request):
    data = json.loads(request.body)

    txt_files = data['txtFiles']
    ann_files = data['annFiles']

    X_train, y_train = get_training_data(txt_files, ann_files)
    X_train, y_train = encode_training_data(X_train, y_train)

    # Initialise the learner - CHANGE NUMBER OF ESTIMATORS, THE CLASSIFIER, THE QUERY STRATERGY, ETC.
    global learner
    learner = ActiveLearner(
        #estimator=BertClassifier(),
        estimator=RandomForestClassifier(n_estimators=100),
        query_strategy=uncertainty_sampling,
        X_training=X_train, y_training=y_train
    )

    return HttpResponse(None)


def get_annotation_suggestions(request):
    txt_file = request.POST.get('txtFile')
    current_annotations = get_annotated_texts([request.POST.get('currentAnnotations')])

    ngrams = get_ngram_data(txt_file)

    global vectorizer
    X = vectorizer.transform(ngrams)

    predicted_labels = predict_labels(X)

    predicted_terms = []
    ngrams = list(ngrams)
    for i in range(len(predicted_labels)):
        # Figure out why predicted labels are converted to strings after model has been actively trained
        if int(predicted_labels[i]) == 1:
            if ngrams[i] not in current_annotations:
                predicted_terms.append(ngrams[i])

    return HttpResponse(json.dumps(predicted_terms))


# Get all possible ngrams from letter currently being annotated
def get_ngram_data(txt_file):
    potential_annotations = set()

    sentences = txt_file.split('\n')
    for sentence in sentences:
        # NGRAM RANGE IS LIMITED TO 4
        for n in range(5):
            for ngram in ngrams(sentence.split(' '), n):
                potential_annotation = ' '.join(ngram).lower().strip()

                if potential_annotation == '':
                    continue

                if potential_annotation[-1] in ('.', ',', '?', '!', ':'):
                    potential_annotation = potential_annotation[:-1]

                if potential_annotation == '':
                    continue

                potential_annotation_words = potential_annotation.split(' ')
                stopword_count = 0
                for word in potential_annotation_words:
                    if word in stopwords:
                        stopword_count += 1
                if stopword_count == len(potential_annotation_words):
                    continue

                start_word_indx = 0
                for word_indx in range(len(potential_annotation_words)):
                    if potential_annotation_words[word_indx] in stopwords:
                        start_word_indx += 1
                    else:
                        break

                end_word_indx = len(potential_annotation_words)
                for word_indx in range(len(potential_annotation_words) - 1, -1, -1):
                    if potential_annotation_words[word_indx] in stopwords:
                        end_word_indx -= 1
                    else:
                        break

                potential_annotation = ' '.join(potential_annotation_words[start_word_indx:end_word_indx])

                if potential_annotation == '':
                    continue

                if potential_annotation.count('(') != potential_annotation.count(')'):
                    continue

                if potential_annotation[-1] in ('.', ',', '?', '!'):
                    potential_annotation = potential_annotation[:-1]

                if potential_annotation == '':
                    continue

                potential_annotations.add(potential_annotation)
    return potential_annotations


query_X = None
query_idx = None
# Query n-gram data (have a category for unsure to help improve & category of confident labels)
def query_active_learner(request):
    global vectorizer, learner, query_X, query_idx

    txt_file = request.POST.get('txtFile')
    ngrams = get_ngram_data(txt_file)

    query_X = vectorizer.transform(ngrams).toarray()
    query_idx, query_instance = learner.query(np.array(query_X))

    return HttpResponse(str(query_idx[0]) + '***' + list(ngrams)[query_idx[0]])


def teach_active_learner(request):
    instance = request.POST.get('instance')
    label = request.POST.get('label')
    if instance:
        teach_active_learner_with_text(instance, label)
    else:
        teach_active_learner_without_text(label)
    return HttpResponse(None)


def teach_active_learner_without_text(label):
    global learner, query_X, query_idx
    learner.teach(query_X[query_idx], [label])


def teach_active_learner_with_text(instance, label):
    global learner, vectorizer
    data = np.array(vectorizer.transform([instance]).toarray())
    learner.teach(data, [label])


# Predict labels for n-gram data
def predict_labels(X):
    # ORDER BY CONFIDENCE

    return learner.predict(X)


vectorizer = CountVectorizer()
learner = None
COSINE_THRESHOLD = 0.7
stopwords = set(open('stopwords.txt').read().split('\n'))

TEST = False

if TEST:
    term_to_cui = None
    db = None
    searcher = None
else:
    term_to_cui = pickle.load(open('term_to_cui.pickle', 'rb'))
    db = pickle.load(open('db.pickle', 'rb'))
    searcher = Searcher(db, CosineMeasure())



'''
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
