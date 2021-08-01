![](demo.gif)

## What is Markup?

Markup is an online annotation tool that can be used to transform unstructured documents into structured formats for NLP and ML tasks, such as named-entity recognition. Markup learns as you annotate in order to predict and suggest complex annotations. Markup also provides integrated access to existing and custom ontologies, enabling the prediction and suggestion of ontology mappings based on the text you're annotating.

Please find the open access publication for Markup in Frontiers in Digital Health <a href="https://www.frontiersin.org/articles/10.3389/fdgth.2021.598916/full">here</a>

## Usage

A full-feature version of Markup is available both via website and local installation.

### Online

The online version of Markup can be found <a href="https://www.getmarkup.com/">here</a>.

### Local Server

#### Docker

Run `docker run -d -p 8000:8000 samueldobbie/markup` and visit <a href="http://localhost:8000">http://localhost:8000</a>.

#### Manual Installation

1. Clone or download the repository.

2. Run `python setup.py` using 64-bit Python3.

3. Visit <a href="http://localhost:8000">http://localhost:8000</a>.

For futher sessions, the local server can be started directly by running `python manage.py runserver localhost:8000`.

## Documentation

Documentation to help with setting up and using Markup can be found <a href="https://www.getmarkup.com/doc">here</a>.

## Features

- Ability to navigate between and annotate multiple documents in a single session.
- Predictive annotation suggestions (incl. attributes) using underlying active learning and sequence-to-sequence models.
- Integrated access to pre-loaded and user-defined ontologies, enabling predictive mappings and direct querying.
- Built-in configuration file creator.
- Built-in synthetic data generator and custom model trainer (local version only due to high computational expense).
- Dynamic attribute display.
- Any number of overlaying annotations, enabling the capture of complex data.
- Full-feature tool available via local installation and website.
- Dark mode.

## Future Plans

- Add user accounts.
- Add ability for users to join a team and share ontologies, documents, guidelines, annotations, etc.
- Accessible version for colour-blind users.
- Add ability to perform text and image classification.
- Add ability to annotate images.

## Known Bugs / Issues
- Annotations may be offset when annotating across newlines in CRLF (Windows) text documents. The offset is purely visual; the exported indicies will be correct.
- When using the website version of Markup, certain features may freeze while annotations are being predicted.
