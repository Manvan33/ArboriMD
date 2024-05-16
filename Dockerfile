FROM python:3.10-slim

RUN pip install --upgrade pip

# Set the working directory in the container
WORKDIR /code

# Install dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project code into the container
COPY . /code/

CMD gunicorn -w 4 --error-logfile "-" --access-logfile "-" -b 0.0.0.0:5000 "main:app"
