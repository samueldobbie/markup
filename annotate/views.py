from simstring.feature_extractor.character_ngram import CharacterNgramFeatureExtractor
from simstring.measure.cosine import CosineMeasure
from simstring.searcher import Searcher
from django.http import HttpResponse
from django.shortcuts import render, redirect
import pickle
import json
import os

all_files = []
all_files_count = 1
def annotate_data(request, data_file_path):
    os.chdir('/')

    # Adds all text files from selected directory to a list and opens first document to start annotating
    global all_files_count
    if os.path.isdir(data_file_path):
        for afile in os.listdir(data_file_path):
            if afile.endswith('.txt'):
                all_files.append(os.path.join(data_file_path, afile))
                all_files_count += 1
        if len(all_files) > 0:
            data_file_path = all_files[0]
            del all_files[0]
            return redirect('/annotate/' + data_file_path)

    data = dict()
    data['file_data'] = open(data_file_path, encoding='utf8').read()

    config_file_path = os.path.dirname(data_file_path) + '/annotation.conf'
    config_data = open(config_file_path, encoding='utf8').readlines()
    config_data = [x.strip() for x in config_data]

    # Read in all the configuration values
    configs = []
    config_key = ''
    config_values = []
    for line in config_data:
        if line == '':
            continue
        
        if len(line) >= 3 and line[0] == '[' and line[-1] == ']':
            if config_key != '':
                configs.append(config_key)
                data[config_key] = config_values
                config_values = []
            config_key = line[1:-1]
            continue

        config_values.append(line)

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
            for arg in vals_split[0].split(','):
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

    print(vals)

    data['args'] = args
    data['vals'] = vals

    if config_values != []:
        configs.append(config_key)
        data[config_key] = config_values

    data['ann_filename'] = os.path.basename(os.path.splitext(data_file_path)[0]) + '.ann'

    context = dict()
    context['dict'] = data

    return render(request, 'annotate/annotate.html', context)


# Returns file path of next document to be annotated
def move_to_next_file(request, data_file_path):
    if len(all_files) > 0:
        data_file_path = all_files[0]
        del all_files[0]
        return HttpResponse('/annotate/' + data_file_path)
    else:
        return HttpResponse('/finished/')  


# Takes user to 'finished' page after all documents have been iterated through
def finished(request):
    global all_files_count
    doc_no = ''
    if all_files_count == 1:
        doc_no = '1 document'
    else:
        doc_no = str(all_files_count - 1) + ' documents'
    return render(request, 'annotate/finished.html', {'count': doc_no})


# Performs lookup of cui based on selected UMLS term
def get_cui(request, data_file_path):
    match = request.GET['match']
    cui = cui_lookup_table[match]
    return HttpResponse(json.dumps(cui))


# Outputs the input annotations to .ann file
def write_to_ann(request, data_file_path):
    annotations = request.GET['annotations']
    ann_filename = request.GET['ann_filename']

    file_path = os.path.dirname(data_file_path) + '/' + ann_filename
    with open(file_path, 'a') as f:
        f.write(annotations)
    return HttpResponse(None)


# Removes current .ann file if exists
def remove_ann_file(request, data_file_path):
    ann_filename = request.GET['ann_filename']
    file_path = os.path.dirname(data_file_path) + '/' + ann_filename
    if os.path.exists(file_path):
        os.remove(file_path)
    return HttpResponse(None)


# Returns all relevant UMLS matches that have a cosine similarity value over 0.75, in descending order
def suggest_cui(request, data_file_path):
    results = searcher.ranked_search(request.GET['selectedTerm'], 0.75)
    output = []
    for i in results:
        output.append(i[1] + ',')
    if output != []:
        output[-1] = output[-1][:-1]
    return HttpResponse(output)


# Reads existing .ann file if exists and returns the annotations
def load_existing(request, data_file_path):
    ann_filename = request.GET['ann_filename']
    file_path = os.path.dirname(data_file_path) + '/' + ann_filename

    if os.path.exists(file_path):
        annotations = []
        for i in open(file_path, 'r').read().split('\n'):
            if i is not "":
                annotations.append(i)
        return HttpResponse(json.dumps(annotations))
    else:
        return HttpResponse(json.dumps(None))

'''
with open("database_2char_plus_cuis.pickle", "rb") as input_file:
    db = pickle.load(input_file)

with open("cui_lookup_table_plus_cuis.pickle", "rb") as input_file:
    cui_lookup_table = pickle.load(input_file)

searcher = Searcher(db, CosineMeasure())
'''

