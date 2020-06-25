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
            drug, dose, unit, frequency = parse_prescription_data(document_sentences[i])

            # Add as annotation suggestion if valid
            if drug is not None:
                suggestions.append([document_sentences[i], drug, dose, unit, frequency])

    return HttpResponse(json.dumps(suggestions))


def text_to_sentences(document_text):
    paragraphs = document_text.split('\n')
    sentences = []
    for paragraph in paragraphs:
        for sentence in paragraph.split('.'):
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

    drug, dose, unit, frequency = '', '', '', ''

    # Parse drug name
    drug = get_drug(sentence.lower())

    # Stop parsing if sentence doesn't contain drug name
    if drug is None:
        return None, None, None, None

    # Parse dose, unit and frequency (if they exist)
    for token in sentence.split(' '):
        if is_dose(token) and dose == '':
            dose = re.search(r'\d+', token)[0]

        if is_unit(token) and unit == '':
            unit = re.sub(r'\d+', '', token)

        if is_frequency(token) and frequency == '':
            frequency = token

    return drug, dose, unit, frequency


def get_drug(sentence):
    '''
    Generate ngrams for current sentence for lengths [1, 3]
    and check if ngram is a valid drug name
    '''

    for n in range(3, 0, -1):
        sentence_ngrams = ngrams(sentence.lower().split(' '), n)
        for ngram_words in sentence_ngrams:
            ngram = ' '.join(ngram_words)
            if ngram in drugs:
                return ngram
    return None


def is_dose(token):
    return any(char.isdigit() for char in token)


def is_unit(token):
    for unit in units:
        if unit in token.lower():
            return True
    return False


def is_frequency(token):
    return token.lower() in ('bd', 'morning', 'afternoon', 'evening')


def query_active_learner(request):
    '''
    Query document sentences to enable
    the labelling of uncertain sentences
    '''

    global query_instance

    document_text = request.POST['text']
    document_sentences = text_to_sentences(document_text)
    clean_document_sentences = clean_sentences(document_sentences)

    query_x = vectorizer.transform(clean_document_sentences).toarray()
    query_index, query_instance = learner.query(np.array(query_x))
    query_index = query_index[0]

    return HttpResponse(document_sentences[query_index])


def teach_active_learner(request):
    sentence = request.POST.get('sentence')
    label = request.POST.get('label')

    if sentence:
        teach_active_learner_with_text(sentence, label)
    else:
        teach_active_learner_without_text(label)

    return HttpResponse(None)


def teach_active_learner_without_text(label):
    learner.teach(query_instance, [label])


def teach_active_learner_with_text(instance, label):
    data = np.array(vectorizer.transform([instance]).toarray())
    learner.teach(data, [label])


SIMILARITY_THRESHOLD = 0.7

simstring_searcher = None
term_to_cui = None

learner = pickle.load(open('data/pickle/prescription_model.pickle', 'rb'))
vectorizer = pickle.load(open('data/pickle/prescription_vectorizer.pickle', 'rb'))

stopwords = set(open('data/txt/stopwords.txt').read().split('\n'))
drugs = set(open('data/txt/drugs.txt').read().split('\n'))

units = ['mg', 'mgs', 'milligram', 'milligrams', 'g', 'gs', 'gram', 'grams']
