FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Run migrations and start app
CMD flask db upgrade && gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:8080 run:flask_app