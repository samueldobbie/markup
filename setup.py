import os

def setup():
    if os.system('pip3 install -r requirements.txt') != 0:
        print('pip3 has not been installed or you are using 32-bit Python instead of 64-bit.')
        return

    if os.system('python3 manage.py runserver') == 0:
        os.system('python3 manage.py migrate')
    elif os.system('python manage.py runserver') == 0:
        os.system('python manage.py migrate')
    else:
        print('Error: Python3 has not been installed.')

if __name__ == '__main__':
    setup()
