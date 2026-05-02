# PHx2 - Modern Collaborative Spotify Listening

PHx2 is a high-performance, minimalist web application that allows friends to sync their Spotify playback in real-time. This version is a complete modernization of the original project, featuring a premium glassmorphic UI and a robust, modern tech stack.

## ✨ Features

- **Real-time Sync**: Collaborative Spotify playback with minimal latency.
- **Midnight Glass UI**: A stunning, responsive design built with Tailwind CSS v4.
- **Safe Operations**: Modernized backend with strict data validation and safe ORM practices.
- **Automated Testing**: Comprehensive unit tests for all core backend logic.
- **CI/CD Integrated**: Automated build and test verification via GitHub Actions.

## 🛠️ Tech Stack

- **Backend**: Django 3.2+ (REST Framework)
- **Frontend**: React 18, Tailwind CSS v4, MUI v6 (Icons)
- **Navigation**: React Router v6
- **Build System**: Webpack 5 + PostCSS

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **Spotify Developer Account** (with Client ID and Client Secret)

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Build the frontend (one-time or production)
npm run build
```

---

## 💻 Development Workflow

To run the application locally, you need to start both the Django server and the Webpack watch process.

### Terminal A: Frontend (Watch Mode)
```bash
cd frontend
npm run dev
```

### Terminal B: Backend
```bash
python manage.py runserver
```

*Note: If you encounter OpenSSL issues on Node 17+, the dev script automatically handles `--openssl-legacy-provider`.*

---

## 🧪 Testing

We use Django's testing framework for backend verification.

```bash
# Run all tests
python manage.py test
```

For a detailed guide on testing procedures and walkthroughs, see [TESTING.md](./TESTING.md).

---

## 📝 License
This project is licensed under the MIT License.
