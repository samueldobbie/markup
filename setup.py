import os


def setup():
    if os.system('pip3 install -r requirements.txt') != 0:
        print('pip3 has not been installed.')
        return

    if os.system('python3 manage.py runserver') == 0:
        os.system('python3 manage.py migrate')
    elif os.system('python manage.py runserver') == 0:
        os.system('python manage.py migrate')
    else:
        print('Error: Python 3 has not been installed.')


setup()
