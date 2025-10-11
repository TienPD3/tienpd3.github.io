# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- This is a static site served from plain HTML/JS. The homepage (index.html) renders a configurable menu via assets/js/menu.js using assets/storage/menu.json.
- Feature pages live under pages/ and load their logic from assets/js/*.js.
- A small Python utility (python/generate_vocab_images.py) generates study flashcard images from python/vocab.json using local or cloud image backends.

Common commands
- Serve locally (no build step):
  - From the repo root, start a static server and open the site.
    ```bash path=null start=null
    python3 -m http.server 8000
    # then open http://localhost:8000/
    ```

- Flashcard image generation (Python):
  - Setup a virtualenv and install deps.
    ```bash path=null start=null
    python3 -m venv .venv
    source .venv/bin/activate
    pip install pillow requests openai google-genai
    ```
  - Choose a backend and run. The script reads python/vocab.json and writes images to python/output_images/.
    - Stable Diffusion (local AUTOMATIC1111 API):
      ```bash path=null start=null
      export IMAGE_BACKEND=sd
      export IMAGE_API_URL=http://127.0.0.1:7860
      python3 python/generate_vocab_images.py
      ```
    - OpenAI Images:
      ```bash path=null start=null
      export OPENAI_API_KEY={{OPENAI_API_KEY}}
      export IMAGE_BACKEND=openai
      python3 python/generate_vocab_images.py
      ```
    - Google Gemini Images:
      ```bash path=null start=null
      export GOOGLE_API_KEY={{GOOGLE_API_KEY}}
      export IMAGE_BACKEND=gemini
      # optional: export GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
      python3 python/generate_vocab_images.py
      ```
    - Auto fallback (tries SD → Gemini → OpenAI, then local placeholder):
      ```bash path=null start=null
      export IMAGE_BACKEND=auto
      python3 python/generate_vocab_images.py
      ```
    - Offline fallback: place keys in python/openai.key or python/gemini.key if env vars are not set.

- Running specific feature pages during development:
  - Flashcard: http://localhost:8000/pages/flashcard.html
  - PDF Compare: http://localhost:8000/pages/pdf-compare.html
  - PDF Viewer: http://localhost:8000/pages/pdf-viewer.html

Notes on linting/tests
- There are no package manifests or configs for JS linting/formatting, and no test suite present. Development is iterative via the local server.
- Git repository exists but has some pack file issues (non-monotonic index errors). The main branch tracks origin/main.

Architecture and key flows
- Config-driven menu (index.html, assets/js/menu.js, assets/storage/menu.json)
  - index.html loads Tailwind via CDN and defers to assets/js/menu.js.
  - menu.js:
    - Loads assets/storage/menu.json to render grouped links.
    - Supports light/dark/system theme via a localStorage key (menu_theme) and (prefers-color-scheme) media query.
    - Provides search that normalizes diacritics for better matching.

- PDF Compare (pages/pdf-compare.html, assets/js/pdf-compare.js)
  - UI lets users pick two PDFs and computes SHA-256 hashes in-browser to check equality.
  - Auto-compare mode fetches two remote manifests:
    - https://raw.githubusercontent.com/TienPD3/store.tienpd3.github.io/refs/heads/main/storage/edubit.json
    - https://raw.githubusercontent.com/TienPD3/store.tienpd3.github.io/refs/heads/main/storage/github.json
  - It resolves lesson index → PDF URLs for both sources, fetches bytes, hashes them, and reports status per index.

- PDF Viewer (pages/pdf-viewer.html, assets/js/pdf-viewer.js)
  - Uses pdf.js from a CDN to render PDFs, with toolbar for lesson selection, navigation, zoom, random mode, and a guide overlay (configurable bands/lines by study mode).
  - Bookmarks are maintained in localStorage; a dedicated “bookmarks” lesson replays saved positions across files.
  - Vocabulary-aware audio: loads assets/storage/japan/n4/minnao-n4.json, maps pages to words, and attempts to play associated audio. If none, it falls back to TTS via a Cloudflare Worker proxy.
  - Audio mute state is persisted (localStorage); there is also a manual “Q” re-play mechanism that can temporarily override mute.
  - CORS caveats: remote PDFs must be public and CORS-allowable. Local PDFs under assets/storage/japan should work when served via the local server.

- Flashcards
  - pages/flashcard.html contains a self-contained, minimal flashcard app implemented inline for a few demo sets and a Kanji N4 set loaded from assets/storage/japan/n4/kanji-n4.json.
  - assets/js/flashcard.js implements a richer flashcard experience (emojis, audio cues, timers, shuffle). If you introduce a page that uses this script, ensure the HTML provides the expected DOM element IDs referenced by the script.

- Data and assets
  - assets/storage/ holds JSON datasets and PDFs (Japanese study materials, manifests, and menu.json). These drive the menu, PDF features, and study logic.
  - assets/js/ contains the main feature logic: menu.js, pdf-compare.js, pdf-viewer.js, and the standalone flashcard module.
  - backup/ contains legacy utilities and pages. Some items are linked from the menu under the “Backup” group.

Environment variables (when needed)
- OPENAI_API_KEY: for OpenAI image generation.
- GOOGLE_API_KEY and optionally GEMINI_IMAGE_MODEL: for Gemini image generation.
- IMAGE_BACKEND: sd | openai | gemini | auto.
- IMAGE_API_URL: AUTOMATIC1111 API endpoint if using sd.

Practical tips for this repo
- Serving via python -m http.server from the repo root mirrors GitHub Pages behavior for pathing.
- Some items in assets/storage/menu.json point to website/* routes that may not exist locally; adjust menu.json if links are broken in your working copy.
- Large PDFs and JSON under assets/storage may be heavy—avoid accidental edits; treat them as content, not code.

Deployment
- This is a GitHub Pages site served from the main branch at https://tienpd3.github.io
- Static files are served directly without any build process
- Changes pushed to main are automatically deployed

Troubleshooting
- Menu not loading: Check that assets/storage/menu.json is valid JSON and accessible
- PDF features not working: Ensure PDFs have proper CORS headers if served remotely
- Theme not persisting: Check localStorage for 'menu_theme' key
- Python script errors: Verify API keys are set correctly via environment variables or local key files
