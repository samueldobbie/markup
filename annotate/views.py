from simstring.feature_extractor.character_ngram import CharacterNgramFeatureExtractor
from simstring.measure.cosine import CosineMeasure
from simstring.searcher import Searcher
from django.http import HttpResponse
from django.shortcuts import render
import pickle
import json
import os

def annotate_data(request, data_file_path):
    data = dict()

    os.chdir('/')

    data['file_data'] = open(data_file_path, encoding='utf8').read()

    config_file_path = os.path.dirname(data_file_path) + '/annotation.conf'
    config_data = get_file_lines(config_file_path)
    config_data = [x.strip() for x in config_data]

    configs = []
    config_key = ''
    config_values = []
    for line in config_data:
        if line == '':
            continue
        
        if len(line) >= 3 and line[:3] == '###':
            if config_key != '':
                configs.append(config_key)
                data[config_key] = config_values
                config_values = []
            config_key = line[4:]
            continue

        config_values.append(line)

    if config_values != []:
        configs.append(config_key)
        data[config_key] = config_values

    data['ann_filename'] = os.path.basename(os.path.splitext(data_file_path)[0]) + '.ann'

    context = dict()
    context['dict'] = data

    return render(request, 'annotate/annotate.html', context)


def get_file_lines(file_path):
    with open(file_path, encoding='utf8') as f:
        return f.readlines()


def write_match_to_ann(request, data_file_path):
    annotations = request.GET['annotations']
    match = request.GET['match']
    cui = cui_lookup_table[match]
    print('\n')
    print(cui)
    print('\n')
    annotations += ' ' + cui
    ann_filename = request.GET['ann_filename']
    with open(os.path.dirname(data_file_path) + '/' + ann_filename, 'a') as f:
        f.write(annotations)
    return HttpResponse(None)


def write_to_ann(request, data_file_path):
    annotations = request.GET['annotations']
    ann_filename = request.GET['ann_filename']
    with open(os.path.dirname(data_file_path) + '/' + ann_filename, 'a') as f:
        f.write(annotations)
    return HttpResponse(None)


def suggest_cui(request, data_file_path):
    results = searcher.ranked_search(request.GET['selectedTerm'], 0.75)

    output = []
    for i in results:
        output.append(i[1] + ',')

    if output != []:
        output[-1] = output[-1][:-1]

    return HttpResponse(output)

with open("database_2char_plus_cuis.pickle", "rb") as input_file:
    db = pickle.load(input_file)

with open("cui_lookup_table_plus_cuis.pickle", "rb") as input_file:
    cui_lookup_table = pickle.load(input_file)

searcher = Searcher(db, CosineMeasure())
