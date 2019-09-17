import json
import os
import pickle
import PySimpleGUI as gui
import requests

from django.http import HttpResponse
from django.shortcuts import render, redirect

from nltk import sent_tokenize
from nltk import word_tokenize
from nltk import ngrams

from simstring.feature_extractor.character_ngram import (
    CharacterNgramFeatureExtractor)
from simstring.database.dict import DictDatabase
from simstring.measure.cosine import CosineMeasure
from simstring.searcher import Searcher


def get_config_file_path(data_file_path):
    """
    Return config file path based on whether a single
    document or a directory is being opened.
    """
    if data_file_path[-4:] == '.txt':
        config_file_path = os.path.dirname(data_file_path) + '/annotation.conf'
    else:
        config_file_path = data_file_path + '/annotation.conf'

    return config_file_path


def get_config_data(config_file_path):
    """
    Read and clean configuration data or redirect to
    homepage if no configuration file exists.
    """
    try:
        config_data = open(config_file_path, encoding='utf8').readlines()
    except:
        gui.Popup('Missing annotation.conf file. Create one is the directory \
            you\'re trying to open.', title='Error: Missing annotation.conf')
        return redirect('ccf/')

    return [x.strip() for x in config_data] 


def initialize_file_lists(data_file_path):
    """
    Adds all documents from selected directory to a list
    and opens first document to being annotation process.
    """
    global total_file_count
    global current_file
    global next_files
    if os.path.isdir(data_file_path):
        for filename in os.listdir(data_file_path):
            if filename.endswith('.txt'):
                next_files.append(os.path.join(data_file_path, filename))
                total_file_count += 1
        next_files.sort()


def parse_config_values(config_data):
    """
    Extract data from annotation.conf configuration file
    """
    # Read in all the configuration values
    data = dict()
    entity_list = []
    config_key = ''
    config_values = []
    add_entities = False
    for line in config_data:
        if line == '':
            continue

        if add_entities:
            entity_list.append(line)

        if len(line) >= 3 and line[0] == '[' and line[-1] == ']':
            if config_key != '':
                data[config_key] = config_values
                config_values = []
            config_key = line[1:-1]

            if add_entities:
                add_entities = False

            if config_key.lower() == 'entities':
                add_entities = True
            continue
        config_values.append(line)

    if len(entity_list) - 1 >= 0:
        del entity_list[len(entity_list) - 1]

    return entity_list, config_values, config_key, data


def annotate_data(request, data_file_path):
    os.chdir('/')

    config_file_path = get_config_file_path(data_file_path)
    config_data = get_config_data(config_file_path)
    initialize_file_lists(data_file_path)

    # Start annotating first document if directory was opened
    global current_file
    global next_files
    if os.path.isdir(data_file_path) and len(next_files) > 0:
        data_file_path = next_files[0]
        current_file = next_files[0]
        del next_files[0]
        if data_file_path[0] != '/':
            return redirect('/annotate/' + data_file_path)
        else:
            return redirect('/annotate' + data_file_path)

    entity_list, config_values, config_key, data = parse_config_values(
        config_data)

    data['file_data'] = open(data_file_path, encoding='utf8').read()

    # Read in all configuration arguments
    args = []
    vals = []
    for i in range(len(config_values)):
        args_split = config_values[i].split('Arg:')
        config_values[i] = args_split[0].strip()
        vals_split = ''

        if len(args_split) > 1:
            vals_split = args_split[1].split('Value:')

        if len(vals_split) == 1:
            for arg in vals_split[0].split(','):
                new_args = []
                new_args.append(args_split[0].strip())
                if arg.strip() is not '':
                    new_args.append(arg.strip())

                if len(new_args) > 1:
                    args.append(new_args)

        if len(vals_split) == 2:
            args_list = []
            global_entity = False
            for arg in vals_split[0].split(','):
                if arg.lower().strip() == '<entity>':
                    global_entity = True
                    for i in entity_list:
                        args_list.append(i)
                    break
                if arg.strip() is not '':
                    args_list.append(arg.strip())

            for arg in args_list:
                new_vals = []
                new_vals.append(arg)
                new_vals.append(args_split[0].strip())
                for val in vals_split[1].split('|'):
                    if val.strip() is not '':
                        new_vals.append(val.strip())

                if len(new_vals) > 1:
                    vals.append(new_vals)

    # Prevent issues caused by having duplicate attributes
    final_args = []
    for arg in args:
        if arg not in final_args:
            final_args.append(arg)

    data['args'] = args
    data['vals'] = vals

    if config_values != []:
        # Prevent issues caused by having duplicate attributes
        config_values = list(dict.fromkeys(config_values))
        data[config_key] = config_values

    data['ann_filename'] = os.path.basename(
            os.path.splitext(data_file_path)[0]) + '.ann'

    context = dict()
    context['dict'] = data

    return render(request, 'annotate/annotate.html', context)


# Returns file path of next document to be annotated
def move_to_next_file(request, data_file_path):
    """
    Move to annotation page for next document upon user click
    """
    global current_file
    if len(next_files) > 0:
        data_file_path = next_files[0]
        previous_files.append(current_file)
        current_file = next_files[0]
        del next_files[0]
        return HttpResponse('/annotate/' + data_file_path)
    else:
        return HttpResponse('/finished/')


def move_to_previous_file(request, data_file_path):
    """
    Move to annotation page for previous document upon user click
    """
    global current_file
    if len(previous_files) > 0:
        data_file_path = previous_files[-1]
        next_files.insert(0, current_file)
        current_file = previous_files[-1]
        del previous_files[-1]
        return HttpResponse('/annotate/' + data_file_path)


def finished(request):
    """
    Takes user to 'finished' page after all documents
    have been iterated through
    """
    global total_file_count
    doc_no = ''
    if total_file_count == 1:
        doc_no = '1 document'
    else:
        doc_no = str(total_file_count - 1) + ' documents'
    total_file_count = 1
    return render(request, 'annotate/finished.html', {'count': doc_no})


def get_cui(request, data_file_path):
    """
    Performs lookup of cui based on selected UMLS term
    """
    return HttpResponse(term_to_cui[request.GET['match']])


def write_to_file(request, data_file_path):
    """
    Outputs the input annotations to .ann file
    """
    file_name = request.GET['file_name']
    annotation = request.GET['annotations']

    file_path = os.path.dirname(data_file_path) + '/' + file_name
    with open(file_path, 'a') as f:
        f.write(annotation)

    return HttpResponse(None)


def delete_file(request, data_file_path):
    """
    Removes current .ann file if exists
    """
    file_name = request.GET['file_name']
    file_path = os.path.dirname(data_file_path) + '/' + file_name
    if os.path.exists(file_path):
        os.remove(file_path)
    return HttpResponse(None)


def suggest_cui(request, data_file_path):
    """
    Returns all relevant UMLS matches that have a cosine
    similarity value over 0.75, in descending order
    """
    output = []
    for i in searcher.ranked_search(request.GET['selectedTerm'],
                                    COSINE_THRESHOLD):
        output.append(i[1] + '***')
    if output != []:
        output[-1] = output[-1][:-3]
    return HttpResponse(output)


# Reads existing .ann file if exists and returns the annotations
def load_existing(request, data_file_path):
    ann_filename = request.GET['ann_filename']
    file_path = os.path.dirname(data_file_path) + '/' + ann_filename

    if os.path.exists(file_path):
        annotations = []
        for i in open(file_path, 'r').read().split('\n'):
            if i is not '':
                annotations.append(i)
        return HttpResponse(json.dumps(annotations))
    else:
        return HttpResponse(json.dumps(None))


def auto_annotate(request, data_file_path):
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

COSINE_THRESHOLD = 0.75
TESTING = False
previous_files = []
next_files = []
total_file_count = 1
current_file = ''

if TESTING:
    term_to_cui = None
    db = None
    searcher = None
else:
    term_to_cui = pickle.load(open('term_to_cui.pickle', 'rb'))
    db = pickle.load(open('db.pickle', 'rb'))
    searcher = Searcher(db, CosineMeasure())


'''
def get_cui(request, data_file_path):
    r = requests.get('http://www.getmarkup.com/umls_api/get_cui/' +
                     request.GET['match'])
    return HttpResponse(json.dumps(r.json()['cui']))


def suggest_cui(request, data_file_path):
    """
    Returns all relevant UMLS matches that have a cosine
    similarity value over 0.75, in descending order
    """
    r = requests.get('http://www.getmarkup.com/umls_api/' +
                     request.GET['selectedTerm'])
    output = []
    for i in r.json()['results']:
        output.append(i[1] + ',')
    if output != []:
        output[-1] = output[-1][:-1]
    return HttpResponse(output)


def auto_annotate(request, data_file_path):
    doc_text = request.GET['document_text']
    doc_ngrams = []
    for sentence in sent_tokenize(doc_text):
        tokens = sentence.split()
        x = len(tokens)
        if x > 3:
            x = 4
        for n in range(2, x):
            for ngram in ngrams(tokens, n):
                term = ' '.join(list(ngram))
                if term not in doc_ngrams:
                    doc_ngrams.append(term)

    raw_sentence_ngrams = []
    clean_sentence_ngrams = []
    for raw_ngram in doc_ngrams:
        if not raw_ngram[-1].isalnum():
            raw_ngram = raw_ngram[:-1]

        clean_ngram = ""
        for char in raw_ngram:
            if char.isalnum():
                clean_ngram += char.lower()
            else:
                clean_ngram += ' '
        clean_ngram = ' '.join([word for word in clean_ngram.split()])
        if clean_ngram is not '':
            raw_sentence_ngrams.append(raw_ngram)
            clean_sentence_ngrams.append(clean_ngram)

    raw_ngrams = ''
    clean_ngrams = ''

    results = []
    for i in range(0, len(raw_sentence_ngrams), 100):
        raw_ngrams = ''
        clean_ngrams = ''
        if i + 100 > len(raw_sentence_ngrams):
            for j in range(i, len(raw_sentence_ngrams)):
                raw_ngrams += '***' + raw_sentence_ngrams[j]
                clean_ngrams += '***' + clean_sentence_ngrams[j]
        else:
            for j in range(i, i + 100):
                raw_ngrams += '***' + raw_sentence_ngrams[j]
                clean_ngrams += '***' + clean_sentence_ngrams[j]
        results.append(requests.get(
            'http://www.getmarkup.com/umls_api/get_multiple/' +
             raw_ngrams + '/' + clean_ngrams).json()['results'])

    final_results = []
    for i in results:
        final_results += i

    return HttpResponse(json.dumps(final_results))
'''
