# PHx2 Testing Walkthrough

This document outlines the testing strategy and procedures for the PHx2 application. We maintain a high standard of code quality through automated unit testing and manual verification.

## 🧪 Backend Testing (Automated)

The backend uses the Django REST Framework testing suite. We currently have **23 unit tests** covering all critical endpoints.

### Running Tests
To run the full test suite, use the following command in the root directory:
```bash
python manage.py test
```

### Coverage Areas
1.  **Room API (`api/tests.py`)**:
    *   Creating rooms with various configurations.
    *   Joining rooms with valid/invalid codes.
    *   Retrieving room details.
    *   Leaving rooms and session cleanup.
    *   Safe handling of non-existent rooms.

2.  **Spotify API (`spotify/tests.py`)**:
    *   Authentication status checks.
    *   Token refresh logic.
    *   Room host authentication verification.
    *   Handling of missing or expired tokens.

---

## 🎨 Frontend Verification (Manual)

Since the frontend is a real-time SPA (Single Page Application), we verify UI changes manually using a browser.

### Verification Checklist
1.  **Home Page**:
    *   Verify the ambient background glows are visible.
    *   Check responsiveness on mobile/desktop.
    *   Ensure "Join Room" and "Start a Room" buttons navigate correctly.

2.  **Room Creation**:
    *   Test the toggle for "Guest Controls".
    *   Verify the "Votes to Skip" counter updates correctly.
    *   Ensure the room launches and redirects to the correct URL.

3.  **Room Interface**:
    *   Verify the song-reactive background updates when music is playing.
    *   Check the "Copy Code" button functionality (it should show a "Copied" snackbar).
    *   Test the Music Player controls (Play/Pause/Skip) if a Spotify session is active.

---

## 👷 Continuous Integration (CI)

We use **GitHub Actions** to ensure every pull request or push to the main branch is stable.

- **Pipeline File**: `.github/workflows/ci.yml`
- **Actions Performed**:
    1.  Sets up Python 3.9.
    2.  Installs all dependencies from `requirements.txt`.
    3.  Runs the Django test suite.
    4.  Performs a frontend build check (`npm run build`).

If any test fails or the build breaks, the CI will block the merge, ensuring the production-ready code stays clean.

---

## 🛠️ Troubleshooting
If tests fail:
1.  Check if `db.sqlite3` is corrupted (try deleting it and re-running migrations).
2.  Ensure your `PYTHONPATH` includes the project root.
3.  Verify that all requirements are installed: `pip install -r requirements.txt`.
