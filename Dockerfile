# Build Stage for Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npx webpack --mode production

# Final stage
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 DJANGO_SETTINGS_MODULE=PHx2.settings

RUN apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./
COPY --from=frontend-builder /app/frontend/static/frontend/ /app/frontend/static/frontend/

RUN python manage.py collectstatic --no-input

EXPOSE 8000
CMD ["gunicorn", "PHx2.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
