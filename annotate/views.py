import os
import re
import json
import pickle
import requests
import stringdist
import zipfile
import urllib.request
import numpy as np

from django.http import HttpResponse
from django.shortcuts import render
from simstring.database.dict import DictDatabase
from simstring.measure.cosine import CosineMeasure
from simstring.searcher import Searcher
from simstring.feature_extractor.character_ngram import (
    CharacterNgramFeatureExtractor
)
from keras.models import Model, load_model
from keras.layers import Input

from modAL.models import ActiveLearner
from modAL.uncertainty import uncertainty_sampling

from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer


def annotate_data(request):
    return render(request, 'annotate.html', {})


def setup_umls(request):
    '''
    Check whether user has the appropiate permissions to use
    UMLS, setup if valid (incl. download for first time local users)
    '''
    global umls_database, umls_mappings

    # Authenticate UMLS account and get UMLS download link
    data = {
        'umls-username': request.POST['umls-username'],
        'umls-password': request.POST['umls-password']
    }
    response = requests.post('https://9wgxw45k93.execute-api.eu-west-2.amazonaws.com/markup-get-umls-if-valid', json=data)
    download_link = response.text
    valid_user = download_link != ''

    if valid_user:
        # Download and extract UMLS database and mappings for first time users
        if umls_database is None or umls_mappings is None:
            ontology_path = PATH + '/data/ontology/'
            urllib.request.urlretrieve(download_link, ontology_path + 'umls.zip')
            with zipfile.ZipFile(ontology_path + 'umls.zip', 'r') as zf:
                zf.extractall(ontology_path)

            # Pre-loaded UMLS ontology
            umls_database = pickle.load(open(ontology_path + 'umls-database.pickle', 'rb'))
            umls_mappings = pickle.load(open(ontology_path + 'umls-mappings.pickle', 'rb'))

        setup_preloaded_ontology('umls')

    return HttpResponse(valid_user)


def setup_demo(request):
    '''
    Setup the demo documents, configuration
    and ontology
    '''
    response = {}
    response['docs'] = get_demo_docs()
    response['config'] = get_demo_config()

    use_demo_ontology()

    return HttpResponse(json.dumps(response))


def get_demo_docs():
    '''
    Read and return the demo documents
    '''
    documents = []
    for f_name in os.listdir('data/demo/'):
        if 'demo-document' in f_name and f_name.endswith('.txt'):
            with open('data/demo/' + f_name, encoding='utf-8') as f:
                documents.append(f.read())
    return documents


def get_demo_config():
    '''
    Read and return the demo
    configuration file
    '''
    config = ''
    with open('data/demo/demo-config.conf', encoding='utf-8') as f:
        config = f.read()
    return config


def use_demo_ontology():
    '''
    Specify the demo ontology to be used
    for the automated mapping suggestions
    '''
    global simstring_searcher, term_to_cui

    simstring_searcher = Searcher(demo_database, CosineMeasure())
    term_to_cui = demo_mappings


def setup_preloaded_ontology(selected_ontology):
    '''
    Setup user-specified, pre-loaded ontology
    for automated mapping suggestions
    '''
    global simstring_searcher, term_to_cui

    if selected_ontology == 'umls':
        simstring_searcher = Searcher(umls_database, CosineMeasure())
        term_to_cui = umls_mappings

    return HttpResponse(None)


def setup_custom_ontology(request):
    '''
    Setup custom ontology for
    automated mapping suggestions
    '''
    global simstring_searcher, term_to_cui

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


def reset_ontology(request):
    '''
    Void any existing uses of ontologies
    to avoid cross-overs between sessions
    '''
    global simstring_searcher, term_to_cui

    simstring_searcher = None
    term_to_cui = None

    return HttpResponse(None)


def suggest_cui(request):
    '''
    Returns all relevant ontology matches that have a similarity
    value over the specified threshold, ranked in descending order
    '''
    if simstring_searcher is None:
        return HttpResponse(json.dumps([]))

    input_text = clean_selected_term(request.GET['inputText'])
    ranked_matches = get_ranked_ontology_matches(input_text)

    return HttpResponse(json.dumps(ranked_matches))


def clean_selected_term(input_text):
    '''
    Helper function to transform the selected term into the
    same format as the terms within the simstring database
    '''
    return input_text.strip().lower()


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

        # Calculate Levenshtein distance for ranking
        levenshtein_distance = stringdist.levenshtein(
            ontology_term,
            cleaned_term
        )

        # Construct match key with divisor
        key = ontology_term + ' :: UMLS ' + ontology_cui
        weighted_matches[key] = levenshtein_distance

    # Construct list of ranked terms based on levenshtein distasnce value
    ranked_matches = [
        ranked_pair[0] for ranked_pair in sorted(
            weighted_matches.items(),
            key=lambda kv: kv[1]
        )
    ]

    return ranked_matches


def suggest_annotations(request):
    '''
    Return annotation suggestions
    (incl. attributes) for the open document
    '''
    text = request.POST['docText']
    annotations = set(json.loads(request.POST['docAnnotations']))

    # Predict target sentences (that contain prescriptions)
    target_sentences = sentence_classifier.get_target_sentences(text, annotations)

    # Predict attributes from target sentences
    suggestions = []
    for sentence in target_sentences:
        prediction = annotation_predictor.predict(sentence)
        if prediction is not None:
            suggestions.append(prediction)

    return HttpResponse(json.dumps(suggestions))


def teach_active_learner(request):
    '''
    Teach active learner upon acceptance,
    rejection of related annotation
    '''
    sentence = request.POST['sentence']
    label = int(request.POST['label'])
    sentence_classifier.teach(sentence, label)
    return HttpResponse(None)


def teach_seq2seq():
    pass


class SentenceClassifier:
    def __init__(self, PATH):
        self.user_data_path = PATH + '/data/text/user-classifier-data.txt'
        self.synthetic_data_path = PATH + '/data/text/synthetic-classifier-data.txt'
        self.setup_model()

    def setup_model(self):
        '''
        Define active learner and train
        with synthetic + stored examples
        '''
        # Read in training data
        with open(self.user_data_path, encoding='utf-8') as f:
            data = f.read().split('\n')

        with open(self.synthetic_data_path, encoding='utf-8') as f:
            data += f.read().split('\n')

        # Remove duplicates
        data = set(data)

        # Setup vectorizer and prepare training data
        self.vectorizer = CountVectorizer()
        self.X, self.y = [], []
        for row in data:
            row = row.split('\t')
            if len(row) == 2:
                self.X.append(row[0].strip())
                self.y.append(int(row[1]))
        self.X = self.vectorizer.fit_transform(self.X)

        self.learner = ActiveLearner(
            estimator=RandomForestClassifier(),
            query_strategy=uncertainty_sampling,
            X_training=self.X,
            y_training=self.y
        )

    def get_target_sentences(self, text, annotations):
        '''
        Return sentences that contain
        a prescription
        '''
        sentences = self.text_to_sentences(text)

        target_sentences = []
        for sentence in sentences:
            classification = self.learner.predict(self.vectorizer.transform([sentence]))
            if classification[0] == 1 and self.convert_to_export_format(sentence) not in annotations:
                target_sentences.append(sentence)
        return target_sentences

    def convert_to_export_format(self, sentence):
        return '-'.join(sentence.split(' '))

    def text_to_sentences(self, text):
        '''
        Convert body of text into individual sentences
        '''
        sentences = re.split(delimiters, text)
        sentences = map(self.clean_sentence, sentences)
        return list(filter(self.is_valid_sentence, sentences))

    def clean_sentence(self, sentence):
        return sentence.strip()

    def is_valid_sentence(self, sentence):
        return sentence != '' and sentence not in stopwords and len(sentence.split(' ')) >= 3 

    def teach(self, sentence, label):
        '''
        Save training data and update model
        '''
        # Store local data
        sentence = sentence.lower().strip()
        with open(self.user_data_path, 'a', encoding='utf-8') as f:
            f.write(sentence + '\t' + str(label) + '\n')

        # Setup learner with new data (to-do: train incrementally)
        self.setup_model()


class Seq2Seq:
    def __init__(self, PATH):
        # Declare model configurations (same as during training)
        self.latent_dim = 256
        self.num_samples = 50000
        self.data_path = PATH + '/data/text/synthetic-seq2seq-data.txt'
        self.model_path = PATH + '/data/model/seq2seq.h5'

        # Restore model ready for use
        self.restore_model()

    def restore_model(self):
        # Read in training data
        with open(self.data_path, encoding='utf-8') as f:
            lines = f.read().split('\n')

        # Vectorize training data
        input_texts = []
        target_texts = []
        input_words = set()
        target_words = set()
        for line in lines[:min(self.num_samples, len(lines)-1)]:
            line = line.lower()

            # Parse input and target texts
            input_text, target_text = line.split('\t')
            target_text = '\t ' + target_text + ' \n'
            input_texts.append(input_text)
            target_texts.append(target_text)

            # Define vocabulary of input words
            for word in input_text.split(' '):
                input_words.add(word)

            # Define vocabulary of target words
            for word in target_text.split(' '):
                target_words.add(word)

            # Add divisors to vocabularies
            input_words.add(' ')
            target_words.add(' ')

        # Sort vocabularies
        input_words = sorted(list(input_words))
        target_words = sorted(list(target_words))

        # Count texts, tokens and maximum sequence lengths
        self.num_encoder_tokens = len(input_words)
        self.num_decoder_tokens = len(target_words)
        self.max_encoder_seq_length = max([len(input_text.split(' ')) for input_text in input_texts])
        self.max_decoder_seq_length = max([len(target_text.split(' ')) for target_text in target_texts])

        # Index each word in input vocabulary
        self.input_token_index = dict([
            (word, i) for i, word in enumerate(input_words)
        ])

        # Index each word in target vocabulary
        self.target_token_index = dict([
            (word, i) for i, word in enumerate(target_words)
        ])

        encoder_input_data = np.zeros((len(input_texts), self.max_encoder_seq_length, self.num_encoder_tokens), dtype='uint8')

        for i, input_text in enumerate(input_texts):
            for t, word in enumerate(input_text.split(' ')):
                encoder_input_data[i, t, self.input_token_index[word]] = 1.
            encoder_input_data[i, t + 1:, self.input_token_index[' ']] = 1.

        # Restore the model
        self.model = load_model(self.model_path)

        # Construct the encoder
        encoder_inputs = self.model.input[0]
        encoder_outputs, state_h_enc, state_c_enc = self.model.layers[2].output
        encoder_states = [state_h_enc, state_c_enc]
        self.encoder_model = Model(encoder_inputs, encoder_states)

        # Construct the decoder
        decoder_inputs = self.model.input[1]
        decoder_state_input_h = Input(shape=(self.latent_dim,), name='input_3')
        decoder_state_input_c = Input(shape=(self.latent_dim,), name='input_4')
        decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]
        decoder_lstm = self.model.layers[3]
        decoder_outputs, state_h_dec, state_c_dec = decoder_lstm(
            decoder_inputs,
            initial_state=decoder_states_inputs
        )
        decoder_states = [state_h_dec, state_c_dec]
        decoder_dense = self.model.layers[4]
        decoder_outputs = decoder_dense(decoder_outputs)
        self.decoder_model = Model(
            [decoder_inputs] + decoder_states_inputs,
            [decoder_outputs] + decoder_states
        )

        # Reverse-lookup token index to decode sequences back to readable form
        self.reverse_target_word_index = dict(
            (i, word) for word, i in self.target_token_index.items()
        )

    def decode_sequence(self, input_seq):
        # Encode the input as state vectors.
        states_value = self.encoder_model.predict(input_seq)

        # Generate empty target sequence of length 1.
        target_seq = np.zeros((1, 1, self.num_decoder_tokens))

        # Populate the first character of target sequence with the start token
        target_seq[0, 0, self.target_token_index['\t']] = 1.

        # Sampling loop for a batch of sequences
        stop_condition = False
        decoded_sentence = ''
        while not stop_condition:
            output_tokens, h, c = self.decoder_model.predict([target_seq] + states_value)

            # Sample a token
            sampled_token_index = np.argmax(output_tokens[0, -1, :])
            sampled_word = self.reverse_target_word_index[sampled_token_index]

            decoded_sentence += sampled_word + ' '

            # Exit condition: either hit max length or find stop character.
            if (sampled_word == '\n' or len(decoded_sentence.split(' ')) > self.max_decoder_seq_length):
                stop_condition = True

            # Update the target sequence (of length 1).
            target_seq = np.zeros((1, 1, self.num_decoder_tokens))
            target_seq[0, 0, sampled_token_index] = 1.

            # Update states
            states_value = [h, c]

        return decoded_sentence

    def clean_raw_sentence(self, sentence):
        '''
        Seperate all dosages and units (e.g. 350mgs -> 350 mgs)
        contained with a sentence
        '''
        updated_sentence = ''
        for component in re.split('(\d+)', sentence):
            updated_sentence += component.strip() + ' '
        return ' '.join(updated_sentence.split(' ')).lower()

    def predict(self, raw_sentence):
        '''
        Predict single prescription contained
        within sentence (extracting drug name,
        dosage, unit, frequency)
        '''
        clean_sentence = self.clean_raw_sentence(raw_sentence)

        if len(clean_sentence.split(' ')) >= self.max_encoder_seq_length:
            vector = np.zeros((1, len(clean_sentence.split(' ')) + 1, self.num_encoder_tokens), dtype='uint8')
        else:
            vector = np.zeros((1, self.max_encoder_seq_length, self.num_encoder_tokens), dtype='uint8')

        for i, word in enumerate(clean_sentence.split(' ')):
            if word in self.input_token_index:
                vector[0, i, self.input_token_index[word]] = 1.
        vector[0, i + 1, self.input_token_index[' ']] = 1.

        sequence = self.decode_sequence(vector).strip().split('; ')

        if len(sequence) == 4:
            drug_name = sequence[0].split('dn: ')[1]
            drug_dose = sequence[1].split('dd: ')[1]
            drug_unit = sequence[2].split('du: ')[1]
            drug_frequency = sequence[3].split('df: ')[1]
        else:
            return None

        # Only consider prediction valid if drug name and dose appears in sentence
        if drug_name in clean_sentence and drug_dose in clean_sentence:
            # Get ontology term and cui
            ontology_term, ontology_cui = '', ''
            if simstring_searcher is not None:
                ranked_matches = get_ranked_ontology_matches(
                    clean_selected_term(drug_name)
                )

                if len(ranked_matches) != 0:
                    best_match = ranked_matches[0].split(' :: UMLS ')
                    ontology_term = best_match[0]
                    ontology_cui = best_match[1]

            return {
                'sentence': raw_sentence,
                'DrugName': drug_name,
                'DrugDose': drug_dose,
                'DoseUnit': drug_unit,
                'Frequency': drug_frequency,
                'CUIPhrase': ontology_term,
                'CUI': ontology_cui
            }
        return None

    def train(self, instance, label):
        pass

# Project path
PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Define active learner for classifying target sentences
sentence_classifier = SentenceClassifier(PATH)

# Define annotation prediction model
annotation_predictor = Seq2Seq(PATH)

# Simstring parameters
SIMILARITY_THRESHOLD = 0.7
simstring_searcher = None
term_to_cui = None

# Load demo ontology
demo_database = pickle.load(open(PATH + '/data/demo/demo-database.pickle', 'rb'))
demo_mappings = pickle.load(open(PATH + '/data/demo/demo-mappings.pickle', 'rb'))

# Load UMLS ontology
umls_database = None
umls_mappings = None

pickles = [f for f in os.listdir(PATH + '/data/ontology/') if os.path.isfile(os.path.join('data/ontology/', f))]

if 'umls-database.pickle' in pickles and 'umls-mappings.pickle' in pickles:
    umls_database = pickle.load(open(PATH + '/data/ontology/umls-database.pickle', 'rb'))
    umls_mappings = pickle.load(open(PATH + '/data/ontology/umls-mappings.pickle', 'rb'))

# Construct regex string containing sentence delimiters
with open(PATH + '/data/text/sentence-delimiters.txt', encoding='utf-8') as f:
    values = [d.strip('\n') for d in f]
    delimiters = r'({})'.format('|'.join(values))

# Stopwords for cleaning sentences
stopwords = set(open(PATH + '/data/text/stopwords.txt', encoding='utf-8').read().split('\n'))
