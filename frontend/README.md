# FlashDeck Frontend Client

> **Domain:** Full-stack Spaced-Repetition Study Application built with React 18, Vite, and Tailwind CSS.

FlashDeck is the frontend client for the FlashDeck spaced-repetition study platform. It interfaces with the Django REST Framework backend to provide interactive flashcard study sessions, Leitner box progress tracking, deck and card management, and detailed recall analytics.

---

## Tech Stack

- **React 18** (`react`, `react-dom`)
- **Vite 5** (Fast ESBuild & Rollup bundler)
- **React Router DOM v6** (Client-side routing and protected route guards)
- **Axios** (Centralized HTTP client with JWT request/response interceptors)
- **Tailwind CSS & PostCSS** (Custom styled utility classes and 3D card perspective)
- **Lucide React** (Crisp accessible iconography)

---

## Setup & Running Locally

### 1. Enter the frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env` from `.env.example`:
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` points to your backend instance:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 4. Start Vite development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production build test
```bash
npm run build
npm run preview
```

---

## Application Route Table

| Route | Access | Component | Purpose |
|---|---|---|---|
| `/login` | Public | `Login.jsx` | User authentication form returning JWT tokens |
| `/register` | Public | `Register.jsx` | User registration with auto-login on success |
| `/` | Protected | `Dashboard.jsx` | Stats metrics, Leitner box distribution, and ready-to-study decks |
| `/decks` | Protected | `DeckList.jsx` | Searchable, filterable, paginated list of user decks |
| `/decks/new` | Protected | `DeckForm.jsx` | Create a new study deck with subject category |
| `/decks/:id` | Protected | `DeckDetail.jsx` | Deck view, card search, box filter, and card CRUD table |
| `/decks/:id/edit` | Protected | `DeckForm.jsx` | Edit existing deck title and description |
| `/decks/:id/cards/new` | Protected | `CardForm.jsx` | Add card to deck with "Save & add another" workflow |
| `/cards/:id/edit` | Protected | `CardForm.jsx` | Edit question, answer, and hint of existing card |
| `/decks/:id/study` | Protected | `Study.jsx` | Interactive study session with 3D flip card and keyboard shortcuts |

---

## Design Direction: "Paper & Ink Modern Scholar"

Instead of using a generic downloaded admin dashboard theme, FlashDeck was handcrafted from the ground up:
- **Calm, High-Legibility Aesthetic:** Off-white/stone canvas (`bg-stone-50`), crisp white card containers with subtle tactile borders (`border-stone-200`), and dark typography for maximum reading comfort during long study sessions.
- **Color-Blind Accessible Box Identification:** Every Leitner box is distinguishable simultaneously by both its distinct color and its prominent bracketed number (`[1] Box 1`, `[2] Box 2`, ... `[5] Box 5 Mastered`).
- **Responsive Layout:** Engineered and tested to work seamlessly from 390px mobile viewports up to large desktop screens.
- **Three Data States On Every Screen:** Full support for loading spinners, tailored empty states (distinguishing between new decks and empty filter queries), and error retry states.
- **Custom Confirmation Modals:** Strict zero reliance on native `window.confirm()`; modal closes smoothly on Cancel or `Escape`.

---

## Completed Optional Items (Part B)

1. **O-8 `python manage.py seed_demo`:** Seeding script creating demo user `demo_user` (`demopass123`) with 3 realistic decks (Django Architecture, React 18, Web Security) and 60 cards spread across all 5 Leitner boxes.
2. **O-9 Comprehensive Automated Test Suite:** 12 tests verifying auth, owner isolation (404), deck tampering prevention (400), box ladder progression & capping, zero-division stats safety, and invalid type guards.
3. **O-10 Keyboard-Driven Study Session:**
   - `Space`: Flip flashcard
   - `1`: Mark as Missed (drops to Box 1)
   - `2`: Mark as Got it (advances to next box)
   - `Escape`: Exit study session back to deck
   - Smooth CSS 3D flip transition with `perspective` and `transform-style: preserve-3d`.
4. **O-13 URL Query Sync & Filters:** Synchronized search and filter state via `useSearchParams` ensuring filtered deck lists survive browser reloads and shareable links.
5. **F-5 "Save and Add Another":** Efficient card creation flow allowing rapid sequential card entry without round-trip reloads.

---

## What I Would Add With More Time

1. **Activity Heatmap (O-11):** A 30-day GitHub-style daily contribution calendar tracking flashcard review streaks over time.
2. **CSV / Anki Deck Importer (O-2):** Batch card importer supporting CSV pastes and standard Anki `.apkg` format export.
3. **Audio Pronunciation:** Web Speech API integration for language flashcard decks.

---

## Linked Backend Repository
- **Standalone Backend Branch:** [FlashDeck Backend API](https://github.com/Shykat01/FlashDeck_Webbased-Study-App/tree/backend)
- **Monorepo Directory:** [backend/](https://github.com/Shykat01/FlashDeck_Webbased-Study-App/tree/main/backend)
