![](demo.gif)

### What is Markup?

Markup is an online annotation tool that can be used to transform unstructured documents into structured formats for NLP and ML tasks, such as named-entity recognition. Markup learns as you annotate in order to predict and suggest complex annotations. Markup also provides integrated access to existing and custom ontologies, enabling the prediction and suggestion of ontology mappings based on the text you're annotating.

### Usage

A full-feature version of Markup is available both via website and local installation.

#### Online

The online version of markup can be found <a href="https://www.getmarkup.com/">here</a>.

#### Local Server

1. Clone or download the repository.

2. Execute the setup.py script using Python 3 (run `python setup.py` or `python3 setup.py` depending on your configuration).

3. Visit <a href="http://127.0.0.1:8000/">http://127.0.0.1:8000/</a> and start annotating!

For future use, the local server can be started directly, using Python 3, by running `python manage.py runserver` or `python3 manage.py runserver` (depending on your configuration).

### Features

- Ability to switch between and annotate multiple documents in a single session.
- Integrated access to pre-loaded and user-defined ontologies, enabling predictive mappings and direct querying.
- Built-in configuration file creator.
- Predictive annotation suggestions (incl. attributes) using an underlying sequence-to-sequence model.
- Dynamic attribute display.
- Any number of overlaying annotations, enabling the capture of complex data.
- Full-feature tool available via local installation and website.
- Dark mode.

### Future Plans

- Add user accounts.
- Add ability for users to join a team and share ontologies, documents, guidelines, annotations, etc.
- Enable users to input data, or provide examples for synthetic data, to train custom models.
- Accessible version for color-blind users.
- Add ability to perform text + image classification.
- Add ability to annotate images.