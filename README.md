# PHx2 Application

This is a web application built with a **Django** backend and a **React** (Webpack bundled) frontend. It includes a Spotify integration feature.

## Prerequisites

- Python 3
- Node.js & npm

## Setup & Installation

### Backend

1. Install the necessary Python packages (Django, Django REST Framework, requests, etc.).
   ```bash
   pip install django djangorestframework requests
   ```
2. Run database migrations if needed:
   ```bash
   python manage.py migrate
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the node dependencies:
   ```bash
   npm install
   ```

## Running the Application

You will need to run both the frontend build process and the Django development server at the same time.

### 1. Start the Frontend Webpack Server
Navigate into the `frontend` folder and run the dev script.

```bash
cd frontend
# If you are using Node.js v17+, you may need to use the legacy OpenSSL provider:
set NODE_OPTIONS=--openssl-legacy-provider
npm run dev
```
*(This will watch your React files and bundle them automatically into Django's static folder.)*

### 2. Start the Django Backend Server
In the root directory of the project, start the Django development server:

```bash
python manage.py runserver
```

You can now visit `http://127.0.0.1:8000` in your web browser to view the application!
