# markup - text annotation

### Usage (Online)

The online version of markup can be used [here](http://www.getmarkup.com).

### Usage (Offline)

Run the following:
```
pip3 install virtualenv
virtualenv -p python3 markup-demo
cd markup-demo
source bin/activate
git clone https://github.com/samueldobbie/markup.git
cd markup
pip3 install -r requirements.txt
python3 manage.py runserver
```

### Documentation

Documentation can be read [here](http://www.getmarkup.com/learn-more).

### To-Do

- Require user account (or at least license validation of used corpora)
- Allow option to store encrypted dictionary associate with individual / groups of users
- Add semantic similarity (not just lexical)
- Improve security
- Add annotation suggestion ML model associated with each user
- (Potentially) Add annotation suggestion ML model associated with all users. May not be possible to do securely, as each user will have a unique encryption key
- Make configuration file creator intuitive to use
- Write documenation
