# Build Stage for Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npx webpack --mode production

# Final Stage for Django
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/static/frontend/ /app/frontend/static/frontend/

# Build-time secrets (passed via --build-arg / GitHub Actions build-args)
ARG SECRET_KEY
ARG SPOTIFY_CLIENT_ID
ARG SPOTIFY_CLIENT_SECRET
ARG REDIRECT_URI=http://127.0.0.1:8000/spotify/redirect

# Promote build args to runtime environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=PHx2.settings
ENV SECRET_KEY=${SECRET_KEY}
ENV SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
ENV SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
ENV REDIRECT_URI=${REDIRECT_URI}

# Run migrations and start server (simplified for demo)
# In production, use Gunicorn and a real DB
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
