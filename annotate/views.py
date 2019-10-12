import json
import pickle
import requests

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


def get_cui(request):
    """
    Performs lookup of cui based on selected UMLS term
    """
    global searcher
    if searcher is None:
        return HttpResponse('')

    return HttpResponse(term_to_cui[request.GET['match']])


def suggest_cui(request):
    """
    Returns all relevant UMLS matches that have a cosine similarity
    value over the specified threshold, in descending order
    """
    global searcher
    if searcher is None:
        return HttpResponse('')

    selected_term = request.GET['selectedTerm']
    selected_term_words = selected_term.split(' ')
    selected_term_weights = [i for i in range(len(selected_term_words), 0, -1)]
    selected_term_weights_count = len(selected_term_weights)

    # Weight relevant UMLS matches based on word ordering
    weighted_outputs = {}
    for umls_match in searcher.ranked_search(selected_term, COSINE_THRESHOLD):
        umls_term = umls_match[1]
        umls_term_words = umls_term.split(' ')

        score = 0
        for i in range(len(umls_term_words)):
            if i == selected_term_weights_count:
                break
            elif umls_term_words[i] == selected_term_words[i]:
                score += selected_term_weights[i]
        # Add divsor to each term
        weighted_outputs[umls_term + '***'] = score

    # Sort order matches will be displayed based on weights
    output = [i[0] for i in sorted(weighted_outputs.items(), key=lambda kv: kv[1])]
    output.reverse()

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
        searcher = umls_searcher
    elif dictionary_selection == 'noDictionary':
        searcher = None
    elif dictionary_selection == 'userDictionary':
        i = 0
        json_data = json.loads(request.POST['dictionaryData'])
        db = DictDatabase(CharacterNgramFeatureExtractor(2))
        term_to_cui = {}
        for row in json_data:
            values = row.split('\t')
            if len(values) == 2:
                term_to_cui[values[1]] = values[0]
        for value in term_to_cui.keys():
            value = clean_dictionary_term(value)
            i += 1
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
COSINE_THRESHOLD = 0.7

'''
TEST = True

if TEST:
    term_to_cui = None
    umls_db = None
    umls_searcher = None
else:
    term_to_cui = pickle.load(open('term_to_cui.pickle', 'rb'))
    umls_db = pickle.load(open('db.pickle', 'rb'))
    umls_searcher = Searcher(umls_db, CosineMeasure())
'''
