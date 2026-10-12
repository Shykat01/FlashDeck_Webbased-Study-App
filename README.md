# FlashDeck — Your Own Spaced-Repetition Study App

[![Django](https://img.shields.io/badge/Django-5.0+-092e20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.14+-red?logo=django)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18.3+-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2+-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Full-Stack Assignment: Django REST Framework + React**  
> Build the tool you will use to revise for your own interviews: decks of cards that come back exactly when you are about to forget them.

---

## Evaluation / Demo Account for Grader

A seeded evaluation account is pre-configured with 3 complete interview decks and 60 realistic flashcards distributed across all 5 Leitner boxes:

- **Username:** `demo_user`
- **Password:** `demopass123`
- **Email:** `demo@flashdeck.local`
- **Ready Cards Due Now:** 13 cards

*(To re-seed at any time, run `python manage.py seed_demo` inside `backend/`)*

---

## Architecture & Submission Repositories

This project provides both monorepo and standalone branch access to meet the course submission specifications:

| Area | Standalone Branch Link (Recommended) | Monorepo Directory Link |
|---|---|---|
| **Backend API (Django + DRF)** | [FlashDeck Backend Branch](https://github.com/Shykat01/FlashDeck_Webbased-Study-App/tree/backend) | [backend/](https://github.com/Shykat01/FlashDeck_Webbased-Study-App/tree/main/backend) |
| **Frontend Client (React + Vite)** | [FlashDeck Frontend Branch](https://github.com/Shykat01/FlashDeck_Webbased-Study-App/tree/frontend) | [frontend/](https://github.com/Shykat01/FlashDeck_Webbased-Study-App/tree/main/frontend) |

---

## Quick Start Guide

### 1. Backend Setup (Django + DRF)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment & migrate database
cp .env.example .env
python manage.py migrate

# Seed evaluation data (3 decks, 60 cards, 13 due today)
python manage.py seed_demo

# Run automated test suite (12 tests)
python manage.py test

# Start backend server (port 8000)
python manage.py runserver
```

### 2. Frontend Setup (React 18 + Vite)

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start Vite dev server (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Leitner Spaced-Repetition System (Server-Owned Logic)

```
        correct               correct               correct               correct
+---------+         +---------+         +---------+         +---------+         +---------+
|  Box 1  |  --->   |  Box 2  |  --->   |  Box 3  |  --->   |  Box 4  |  --->   |  Box 5  |
+---------+         +---------+         +---------+         +---------+         +---------+
again today           +1 day              +3 days             +7 days            +16 days
     ^                                                                               |
     +------------------------- missed: back to Box 1 -------------------------------+
```

- **Correct Recall:** Advances card to `min(current_box + 1, 5)` and schedules review at `now + INTERVALS[box]`.
- **Missed Recall:** Drops card immediately back to **Box 1** with review scheduled for today (`now`).
- **Server Governance:** Card box and interval fields are completely read-only from the client. Any attempt to modify them via PUT/PATCH is safely ignored.

---

## Self-Check Verification Checklist (Section 9)

- [x] **Clone & Run:** Backend installs via `requirements.txt` and runs without manual fixes.
- [x] **Frontend Vite:** `npm install` and `npm run dev` connects smoothly to the API.
- [x] **Auth Guard:** `GET /api/decks/` without JWT token returns `401 Unauthorized`.
- [x] **Owner Scoping (Isolation):** Requesting User A's deck ID as User B returns `404 Not Found` (never 403 or data).
- [x] **Card Tampering Guard:** Posting a card with another user's deck ID returns `400 Bad Request` under `deck`.
- [x] **Server-Owned Ladder:** `PATCH /api/cards/<id>/` with `{"box": 5}` does not alter the box.
- [x] **Secure Registration:** `POST /api/register/` never echoes password, and user can immediately log in.
- [x] **Filter & Pagination:** `?deck=3&box=1&search=orm&ordering=-created_at&page=1` returns standard DRF envelope (`count`, `next`, `previous`, `results`).
- [x] **Review Progression:** Correct answer advances box and pushes `next_review_at` into future; wrong answer resets to Box 1 and is due now.
- [x] **Box 5 Ceiling:** A card in Box 5 answered correctly stays in Box 5 (never becomes 6).
- [x] **Type Validation:** `POST /api/cards/<id>/review/` with non-boolean returns `400 Bad Request` (never 500).
- [x] **Stats Zero-Division Guard:** Brand new accounts with 0 reviews return `accuracy: 0` and all five box keys `1..5`.
- [x] **Validation Error Mapping:** Form errors map onto corresponding input fields under field names.
- [x] **Three UI States:** Loading, empty, and error (with Retry) states on every data-driven screen.
- [x] **Study Queue Stability:** Queue fetched once per session; missed cards re-queue on "Study again".
- [x] **Custom Delete Modal:** No native `window.confirm()`; modal closes on Cancel or Escape.
- [x] **Responsive Design:** Fluid layout verified down to 390px mobile viewports.
- [x] **Repository Hygiene:** No `.env`, `db.sqlite3`, or `node_modules` committed to git.

---

## Git Repository
GitHub Repository: [FlashDeck_Webbased-Study-App](https://github.com/Shykat01/FlashDeck_Webbased-Study-App.git)
