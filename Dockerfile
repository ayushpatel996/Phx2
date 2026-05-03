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

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=PHx2.settings

# Run migrations and start server (simplified for demo)
# In production, use Gunicorn and a real DB
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
