import re
import json
import pickle
import random
import stringdist
import numpy as np

from django.http import HttpResponse
from django.shortcuts import render
from nltk import ngrams
from simstring.database.dict import DictDatabase
from simstring.measure.cosine import CosineMeasure
from simstring.searcher import Searcher
from simstring.feature_extractor.character_ngram import (
    CharacterNgramFeatureExtractor
)


def annotate_data(request):
    return render(request, 'annotate/annotate.html', {})


def setup_preloaded_ontology(request):
    '''
    Setup user-specified, pre-loaded ontology for
    automated mapping suggestions
    '''
    global term_to_cui, simstring_searcher

    selected_ontology = request.POST['selectedOntology']

    if selected_ontology == 'none' or selected_ontology == 'default':
        pass
    elif selected_ontology == 'umls':
        term_to_cui = pickle.load(open('data/pickle/term_to_cui.pickle', 'rb'))
        umls_database = pickle.load(open('data/pickle/umls_database.pickle', 'rb'))
        simstring_searcher = Searcher(umls_database, CosineMeasure())

    return HttpResponse(None)


def setup_custom_ontology(request):
    global term_to_cui, simstring_searcher

    ontology_data = request.POST['ontologyData'].split('\n')

    database = DictDatabase(CharacterNgramFeatureExtractor(2))
    term_to_cui = {}

    for entry in ontology_data:
        entry_values = entry.split('\t')
        if len(entry_values) == 2:
            term = clean_selected_term(entry_values[1])
            term_to_cui[term] = entry_values[0].strip()

    for term in term_to_cui.keys():
        term = clean_selected_term(term)
        database.add(term)

    simstring_searcher = Searcher(database, CosineMeasure())

    return HttpResponse(None)


def suggest_cui(request):
    '''
    Returns all relevant ontology matches that have a similarity
    value over the specified threshold, ranked in descending order
    '''

    global simstring_searcher

    if simstring_searcher is None:
        return HttpResponse('')

    selected_term = clean_selected_term(request.POST['selectedTerm'])

    # Get ranked matches from ontology
    ontology_matches = simstring_searcher.ranked_search(
        selected_term,
        SIMILARITY_THRESHOLD
    )

    # Weight relevant UMLS matches based on word ordering
    weighted_matches = {}
    for ontology_match in ontology_matches:
        # Get term and cui from ontology
        ontology_term = ontology_match[1]
        ontology_cui = term_to_cui[ontology_term]

        # Construct match key with divisor
        key = ontology_term + ' :: UMLS ' + ontology_cui + '***'

        # Calculate Levenshtein distance for ranking
        levenshtein_distance = stringdist.levenshtein(
            ontology_term,
            selected_term
        )

        weighted_matches[key] = levenshtein_distance

    # Construct list of ranked terms based on levenshtein distasnce value
    ranked_weighted_matches = [
        ranked_pair[0] for ranked_pair in sorted(
            weighted_matches.items(),
            key=lambda kv: kv[1]
        )
    ]

    # Remove divisor from final match term
    if ranked_weighted_matches != []:
        ranked_weighted_matches[-1] = ranked_weighted_matches[-1][:-3]

    return HttpResponse(ranked_weighted_matches)


def clean_selected_term(selected_term):
    '''
    Helper function to transform the selected term into the
    same format as the terms within the simstring database
    '''
    return selected_term.strip().lower()


def suggest_annotations(request):
    '''
    Return annotation suggestions based on the classification
    of sentences containing prescriptions
    '''

    document_text = request.POST['text']
    document_paragraphs = document_text.split('\n')
    document_sentences = []
    for paragraph in document_paragraphs:
        for sentence in paragraph.split('.'):
            document_sentences.append(sentence.strip())

    existing_annotations = set(json.loads(request.POST['annotations']))

    # Vectorize sentences
    X = vectorizer.transform(document_sentences)

    # Predict whether each sentence contains a prescription or not
    predictions = predict_labels(X)

    # Construct valid suggestions to return
    suggestions = []
    for i in range(len(document_sentences)):
        if document_sentences[i] not in existing_annotations and int(predictions[i]) == 1:
            # Parse information from prescription sentence
            drug, dose, unit, frequency = parse_prescription_data(document_sentences[i])

            # Add as annotation suggestion if valid
            if drug is not None:
                suggestions.append([document_sentences[i], drug, dose, unit, frequency])

    return HttpResponse(json.dumps(suggestions))


def parse_prescription_data(sentence):
    '''
    Extract drug name, dose, unit and frequency from a sentence
    that has been classified as containing a prescription
    '''

    drug, dose, unit, frequency = '', '', '', ''

    # Parse drug name
    drug = get_drug(sentence.lower())

    # Stop parsing if sentence doesn't contain drug name
    if drug is None:
        return None, None, None, None

    # Parse dose, unit and frequency (if they exist)
    for token in sentence.split(' '):
        if is_dose(token):
            dose = re.search(r'\d+', token)[0]

        if is_unit(token):
            unit = re.sub(r'\d+', '', token)[0]

        if is_frequency(token):
            frequency = token

    return drug, dose, unit, frequency


def get_drug(sentence):
    for drug in drugs:
        if drug in sentence:
            return drug
    return None


def is_dose(token):
    return any(char.isdigit() for char in token)


def is_unit(token):
    for unit in units:
        if unit in token:
            return True
    return False


def is_frequency(token):
    return token in ('bd', 'morning', 'afternoon', 'evening')


def teach_active_learner(request):
    return HttpResponse(None)


def query_active_learner(request):
    return HttpResponse(None)


def predict_labels(X):
    return learner.predict(X)


SIMILARITY_THRESHOLD = 0.7

simstring_searcher = None
term_to_cui = None

learner = pickle.load(open('data/pickle/prescription_model.pickle', 'rb'))
vectorizer = pickle.load(open('data/pickle/prescription_vectorizer.pickle', 'rb'))
stopwords = set(open('data/txt/stopwords.txt').read().split('\n'))

units = ['mg', 'mgs', 'milligram', 'milligrams', 'g', 'gs', 'gram', 'grams']
drugs = ['lamotrigine', 'ferrous sulphate', 'carbamazepine', 'topiramate', 'sodium valproate', 'levetiracetam', 'bendroflumethiazide'] 
