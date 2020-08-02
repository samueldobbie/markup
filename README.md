# markup - online annotation, powered by active learning

### What is Markup?

Markup is an online annotation tool that can be used to transform unstructured documents into structured formats for NLP and ML tasks, such as named-entity recognition and text classification. Markup learns as you annotate in order to predict and suggest complex annotations. Markup also provides integrated access to existing and custom ontologies, enabling Markup to predict and suggest ontology mappings based on the text you're annotating.

![](https://i.imgur.com/JP7fc1f.png)

### How does Markup compare to existing annotation tools?

to-do: table of iaa score + time + similar metric comparisons

### Usage

A full-feature version of Markup is available both via website and local installation.

#### Online

The online version of markup can be found <a href="http://www.getmarkup.com">here</a>.

#### Local Server

1. Clone or download the repository.

2. Execute the setup.py script using Python 3 (run `python setup.py` or `python3 setup.py` depending on your configuration).

3. Visit <a href="http://127.0.0.1:8000/">http://127.0.0.1:8000/</a> and start annotating!

For future use, the local server can be started directly, using Python 3, by running `python manage.py runserver` or `python3 manage.py runserver` (depending on your configuration).

### Documentation

Documentation for markup can be found <a href="http://www.getmarkup.com/docs">here</a>.

### Features

- Ability to open, move between and annotate multiple documents in a single session.
- Integrated access to pre-loaded and user-defined, enabling automated ontology mappings and direct ontology querying.
- Built-in configuration file creator.
- Predictive prescription suggestions (including drug name, dosage, unit and frequency attributes).
- Dynamic attribute display.
- Any number of overlaying annotations, enabling the capture of complex data.
- Dark mode.
- Full-feature tool available via local installation and website.

### Future Plans

- Add user accounts.
- Add ability for user accounts to join a team / group to enable easy sharing of ontologies, documents, guidelines, annotations, etc.
- Allow users to provide their own data, or examples to produce synthetic data, for training of a custom model.
- Accessible version for color-blind users.
- Add annotation and classification of images.