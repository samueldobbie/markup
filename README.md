# markup - text annotation

### Install & Run (Linux)

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

Then go to:
```
http://127.0.0.1:8000/
```

### Known Issues

If there is a ModuleNotFoundError relating to '_tkinter' or 'global_state' run:
```
sudo apt-get install python3-tk
```

Then re-run:

```
python3 manage.py runserver
```