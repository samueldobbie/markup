FROM python:3.8.6

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 80

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]