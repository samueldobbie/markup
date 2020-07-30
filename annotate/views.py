import os
import re
import requests
import json
import pickle
import stringdist
import numpy as np

from bs4 import BeautifulSoup
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


def is_valid_umls_user(request):
    '''
    Check whether user has the appropiate permissions to use
    the UMLS ontology
    '''

    url = 'https://uts-ws.nlm.nih.gov/restful/isValidUMLSUser'
    data = {
        'licenseCode': umls_license_code,
        'user': request.POST['umls-username'],
        'password': request.POST['umls-password']
    }
    response_text = requests.post(url, data).text
    soup = BeautifulSoup(response_text, features='html.parser')
    result = soup.find('result').string == 'true'

    if result:
        setup_preloaded_ontology('umls')

    return HttpResponse(result)


def setup_demo_documents(request):
    documents = []
    for f_name in os.listdir(DEMO_PATH):
        if 'demo-document' in f_name and f_name.endswith('.txt'):
            with open(DEMO_PATH + f_name, encoding='utf-8') as f:
                documents.append(f.read())
    return HttpResponse(json.dumps(documents))


def setup_demo_config(request):
    config = ''
    with open(DEMO_PATH + 'demo-config.conf', encoding='utf-8') as f:
        config = f.read()
    return HttpResponse(config)


def setup_demo_ontology(request):
    '''
    Setup demo ontology for
    automated mapping suggestions
    '''
    global simstring_searcher, term_to_cui

    ontology_data = ''
    with open(DEMO_PATH + 'demo-ontology.txt', encoding='utf-8') as f:
        ontology_data = f.read().split('\n')

    database, term_to_cui = construct_ontology(ontology_data)
    simstring_searcher = Searcher(database, CosineMeasure())

    return HttpResponse(None)


def setup_preloaded_ontology(selected_ontology):
    '''
    Setup user-specified, pre-loaded ontology
    for automated mapping suggestions
    '''
    global simstring_searcher

    if selected_ontology == 'umls':
        simstring_searcher = Searcher(umls_database, CosineMeasure())

    return HttpResponse(None)


def setup_custom_ontology(request):
    '''
    Setup custom ontology for
    automated mapping suggestions
    '''

    global term_to_cui, simstring_searcher

    ontology_data = request.POST['ontologyData'].split('\n')
    database, term_to_cui = construct_ontology(ontology_data)
    simstring_searcher = Searcher(database, CosineMeasure())

    return HttpResponse(None)


def construct_ontology(ontology_data):
    '''
    Create an n-char simstring database and
    term-to-code mapping to enable rapid ontology
    querying
    '''

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

    return database, term_to_cui


def suggest_cui(request):
    '''
    Returns all relevant ontology matches that have a similarity
    value over the specified threshold, ranked in descending order
    '''

    if simstring_searcher is None:
        return HttpResponse('')

    selected_term = clean_selected_term(request.POST['selectedTerm'])
    ranked_matches = get_ranked_ontology_matches(selected_term)

    return HttpResponse(ranked_matches)


def clean_selected_term(selected_term):
    '''
    Helper function to transform the selected term into the
    same format as the terms within the simstring database
    '''
    return selected_term.strip().lower()


def get_ranked_ontology_matches(cleaned_term):
    '''
    Get ranked matches from ontology
    '''
    ontology_matches = simstring_searcher.ranked_search(
        cleaned_term,
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
            cleaned_term
        )

        weighted_matches[key] = levenshtein_distance

    # Construct list of ranked terms based on levenshtein distasnce value
    ranked_matches = [
        ranked_pair[0] for ranked_pair in sorted(
            weighted_matches.items(),
            key=lambda kv: kv[1]
        )
    ]

    # Remove divisor from final matching term
    if ranked_matches != []:
        ranked_matches[-1] = ranked_matches[-1][:-3]

    return ranked_matches


def suggest_annotations(request):
    '''
    Return annotation suggestions based on the classification
    of sentences containing prescriptions
    '''

    document_text = request.POST['text']
    document_sentences = text_to_sentences(document_text)
    clean_document_sentences = clean_sentences(document_sentences)

    existing_annotations = set(json.loads(request.POST['annotations']))

    # Vectorize sentences
    X = vectorizer.transform(clean_document_sentences)

    # Predict whether each sentence contains a prescription or not
    predictions = predict_labels(X)

    # Construct valid suggestions to return
    suggestions = []
    for i in range(len(document_sentences)):
        if document_sentences[i] not in existing_annotations and int(predictions[i]) == 1:
            # Parse information from prescription sentence
            drug, dose, unit, frequency, ontology_term, ontology_cui = parse_prescription_data(document_sentences[i])

            # Add as annotation suggestion if valid
            if drug is not None:
                suggestions.append([document_sentences[i], drug, dose, unit, frequency, ontology_term, ontology_cui])

    return HttpResponse(json.dumps(suggestions))


def text_to_sentences(document_text):
    paragraphs = document_text.split('\n')
    sentences = []
    for paragraph in paragraphs:
        for sentence in paragraph.split('. '):
            if sentence.strip() != '':
                sentences.append(sentence.strip())
    return sentences


def clean_sentences(raw_sentences):
    clean_sentences = []

    for raw_sentence in raw_sentences:
        clean_sentence = []
        for token in raw_sentence.split(' '):
            if token not in stopwords:
                clean_sentence.append(token.lower())
        clean_sentences.append(' '.join(clean_sentence))

    return clean_sentences


def predict_labels(X):
    return learner.predict(X)


def parse_prescription_data(sentence):
    '''
    Extract drug name, dose, unit and frequency from a sentence
    that has been classified as containing a prescription
    '''

    drug, dose, unit, frequency, ontology_term, ontology_cui = '', '', '', '', '', ''

    # Parse drug name
    drug = get_drug(sentence.lower())

    # Get ontology term and cui
    if simstring_searcher is not None:
        ranked_matches = get_ranked_ontology_matches(clean_selected_term(drug))

        if len(ranked_matches) != 0:
            best_match = ranked_matches[0].replace('***', '').split(' :: UMLS ')
            ontology_term = best_match[0]
            ontology_cui = best_match[1]

    # Parse frequency (if exists)
    frequency = get_frequency(sentence.lower())

    # Parse dose and unit (if exists)
    for token in sentence.split(' '):
        if is_dose(token) and dose == '':
            dose = re.search(r'\d+', token)[0]
        elif is_unit(token) and unit == '':
            unit = re.sub(r'\d+', '', token)

    # Ignore sentence if it doesn't contain a drug, dose, and unit
    if drug == '' or dose == '' or unit == '':
        return None, None, None, None, None, None

    return drug, dose, unit, frequency, ontology_term, ontology_cui


def get_drug(sentence):
    '''
    Generate ngrams for current sentence for lengths [1, 3]
    and check if ngram is a valid drug name
    '''

    for n in range(3, 0, -1):
        sentence_ngrams = ngrams(sentence.split(' '), n)
        for ngram_words in sentence_ngrams:
            ngram = ' '.join(ngram_words)
            if ngram in drugs:
                return ngram
    return ''


def get_frequency(sentence):
    '''
    Generate ngrams for current sentence for lengths [1, 3]
    and check if ngram is a valid frequency
    '''

    for n in range(3, 0, -1):
        sentence_ngrams = ngrams(sentence.split(' '), n)
        for ngram_words in sentence_ngrams:
            ngram = ' '.join(ngram_words)
            if ngram in frequencies.keys():
                return frequencies[ngram]
    return ''


def is_dose(token):
    return any(char.isdigit() for char in token)


def is_unit(token):
    for unit in units:
        if unit in token.lower():
            return True
    return False


def query_active_learner(request):
    '''
    Query document sentences to enable
    the labelling of uncertain sentences
    '''

    global query_sample

    document_text = request.POST['text']
    document_sentences = text_to_sentences(document_text)
    clean_document_sentences = clean_sentences(document_sentences)

    X = np.array(vectorizer.transform(clean_document_sentences).toarray())
    query_idx, query_sample = learner.query(X)

    return HttpResponse(document_sentences[query_idx[0]])


def teach_active_learner(request):
    label = request.POST.get('label')
    learner.teach(query_sample, [label])
    return HttpResponse(None)


SIMILARITY_THRESHOLD = 0.7
DEMO_PATH = 'data/txt/demo/'

simstring_searcher = None
term_to_cui = None
query_sample = None

learner = pickle.load(open('data/pickle/prescription_model.pickle', 'rb'))
vectorizer = pickle.load(open('data/pickle/prescription_vectorizer.pickle', 'rb'))

umls_database = pickle.load(open('data/pickle/umls_database.pickle', 'rb'))
term_to_cui = pickle.load(open('data/pickle/term_to_cui.pickle', 'rb'))

try:
    umls_license_code = open('data/txt/umls-license.txt').read()
except:
    umls_license_code = None

stopwords = set(open('data/txt/stopwords.txt', encoding='utf-8').read().split('\n'))
drugs = set(open('data/txt/drugs.txt', encoding='utf-8').read().split('\n'))
units = open('data/txt/units.txt', encoding='utf-8').read().split('\n')
frequencies = {
    'od': 1,
    'o.d': 1,
    'q1d': 1,
    'q.1.d': 1,
    'qd': 1,
    'q.d': 1,
    'once a day': 1,
    'once daily': 1,
    'morning': 1,
    'afternoon': 1,
    'daily': 1,
    'bd': 2,
    'bds': 2,
    'b.d.s': 2,
    'bid': 2,
    'b.i.d': 2,
    '2 times a day': 2,
    'twice a day': 2,
    'twice daily': 2,
    'tds': 3,
    't.d.s': 3,
    'three times a day': 3,
    'qds': 4,
    'q.d.s': 4,
}
