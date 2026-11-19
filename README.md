# PHx2

PHx2 is a Django and React app for listening to Spotify with friends. A host creates a room, shares its code, and guests can join, vote to skip, and—if enabled—control playback. Spotify playback is controlled through the host's Spotify account.

## Features

- Create and join listening rooms with a short room code.
- Vote to skip tracks and optionally allow guests to pause playback.
- Search Spotify tracks and add them to the host's queue.
- View the current track, queue, top tracks, and playlists.

## Stack

- **Backend:** Python 3.11+, Django 5, Django REST Framework
- **Frontend:** React 18, React Router 6, Tailwind CSS 4, Material UI, Webpack 5
- **Database:** SQLite by default; configure `DATABASE_URL` for another supported database.

## Local setup

Requirements: Python 3.11 or newer, Node.js 20, npm, and a Spotify Developer application.

1. Clone the repository and create/activate a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Create a `.env` file in the repository root. Set `SECRET_KEY` to a long, random value. Add your Spotify app credentials and register the redirect URI in the Spotify Developer dashboard:

   ```dotenv
   SECRET_KEY=replace-with-a-random-secret
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   SPOTIFY_CLIENT_ID=your-client-id
   SPOTIFY_CLIENT_SECRET=your-client-secret
   REDIRECT_URI=http://127.0.0.1:8000/spotify/redirect
   ```

   `SECRET_KEY` is required. `ALLOWED_HOSTS` defaults to `localhost,127.0.0.1`. The redirect URI in your Spotify app must exactly match `REDIRECT_URI`.

3. Install frontend dependencies and build the assets:

   ```bash
   cd frontend
   npm ci --legacy-peer-deps
   npm run build
   cd ..
   ```

4. Set up the database and start Django:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

   Open <http://127.0.0.1:8000>.

For frontend development with automatic rebuilds, run `cd frontend && npm run dev` in a second terminal while Django is running.

## Tests

Run the backend test suite from the repository root:

```bash
python manage.py test
```

The GitHub Actions workflow also checks Django configuration, runs backend tests on Python 3.11 and 3.12, and builds the frontend on Node.js 20 and 22. See [TESTING.md](TESTING.md) for the manual UI checklist.

## Docker

Build and run the production image with the required environment variables supplied at runtime (do not bake secrets into the image):

```bash
docker build -t phx2 .
docker run --rm -p 8000:8000 \
  -e SECRET_KEY='your-random-secret' \
  -e ALLOWED_HOSTS=localhost,127.0.0.1 \
  -e SPOTIFY_CLIENT_ID='your-client-id' \
  -e SPOTIFY_CLIENT_SECRET='your-client-secret' \
  -e REDIRECT_URI='http://127.0.0.1:8000/spotify/redirect' \
  phx2
```

The image serves Django with Gunicorn. For persistent or multi-instance deployments, configure a production database using `DATABASE_URL` and set `ALLOWED_HOSTS` to the deployment's host name.

## License

MIT. See [LICENSE](LICENSE) if present in your checkout.
