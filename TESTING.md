# Testing

## Backend

Run all Django tests from the repository root:

```bash
python manage.py test
```

The tests in `api/tests.py` cover room creation, lookup, joining, and leaving. Tests in `spotify/tests.py` cover Spotify token helpers and room playback permissions. Spotify network calls should be mocked in tests; the suite does not require live Spotify credentials.

To check Django configuration and database migrations locally:

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
```

## Frontend

There is currently no automated frontend test suite. Build the production bundle to catch compilation errors:

```bash
cd frontend
npm ci --legacy-peer-deps
npm run build
```

For UI changes, start the Django server and the Webpack watcher in separate terminals, then verify the affected flow in a browser. Check both desktop and mobile layouts.

### Manual checklist

- **Home:** Join and create-room links navigate correctly; the page fits mobile and desktop screens.
- **Create/join:** Room settings submit, valid codes join successfully, and invalid codes show a useful error.
- **Room:** Copy-code feedback works; track and queue information updates; playback controls respect host/guest permissions.
- **Spotify:** Authentication, search, queue updates, and playback work with a configured Spotify Developer app and an active Spotify session.

## Continuous integration

`.github/workflows/ci.yml` runs Django checks and tests with Python 3.11 and 3.12, and builds the frontend with Node.js 20 and 22. Run the same commands locally before opening a pull request.
