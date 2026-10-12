# FlashDeck Backend API

> **Domain:** Full-stack Spaced-Repetition Study System (Leitner Box Model) for Software Engineering, Interview Prep & Technical Mastery.

FlashDeck is a private, server-governed flashcard application built with Django REST Framework. Cards advance through 5 Leitner boxes with spaced intervals on successful recall and reset to Box 1 when missed. All decks and cards are strictly owner-scoped.

---

## Tech Stack

- **Python 3.12+**
- **Django 5.0+**
- **Django REST Framework (DRF)**
- **djangorestframework-simplejwt** (Stateless JWT authentication)
- **django-cors-headers** (CORS middleware for React Vite)
- **django-filter** (Declarative field filtering)
- **python-decouple** (Environment configuration)
- **SQLite3**

---

## Setup & Running Locally

### 1. Clone repository & enter backend directory
```bash
cd backend
```

### 2. Create and activate a virtual environment
```bash
python -m venv venv

# Windows (Command Prompt / PowerShell)
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 5. Run migrations
```bash
python manage.py migrate
```

### 6. (Optional) Seed demo data
Populates a full evaluation user (`demo_user` / `demopass123`) with 3 realistic decks and 60 cards spread across all 5 Leitner boxes:
```bash
python manage.py seed_demo
```

### 7. Run automated test suite
```bash
python manage.py test
```

### 8. Start development server
```bash
python manage.py runserver
```
The API is available at `http://127.0.0.1:8000/api/` and Django Admin at `http://127.0.0.1:8000/admin/`.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django cryptographic signing key | Provided default for development |
| `DEBUG` | Toggle debug mode (`True`/`False`) | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for cross-origin frontend requests | `http://localhost:5173,http://127.0.0.1:5173` |
| `TIME_ZONE` | Django timezone setting | `Asia/Dhaka` |

---

## Leitner Box Schedule (Spaced Repetition Ladder)

The spaced-repetition logic is server-owned. Review results apply the following deterministic intervals:

| Box | Interval | Next Review Date Calculation |
|---|---|---|
| **Box 1** | 0 days | Due immediately (`now`) |
| **Box 2** | +1 day | `now + 1 day` |
| **Box 3** | +3 days | `now + 3 days` |
| **Box 4** | +7 days | `now + 7 days` |
| **Box 5** | +16 days | `now + 16 days` (Mastered ceiling, caps at 5) |

- **Correct Answer:** `card.box = min(card.box + 1, 5)`; `next_review_at = now + INTERVALS[card.box]`.
- **Missed Answer:** `card.box = 1`; `next_review_at = now` (immediately due again in session).

---

## API Endpoints Reference

| Method | Endpoint | Auth Level | Description |
|---|---|---|---|
| `POST` | `/api/register/` | Public | Register new user (`username`, `email`, `password`) |
| `POST` | `/api/login/` | Public | Obtain JWT tokens (`access`, `refresh`) |
| `POST` | `/api/token/refresh/` | Public | Refresh expired access token |
| `GET` | `/api/decks/` | IsAuthenticated | Paginated list of logged-in user's decks |
| `POST` | `/api/decks/` | IsAuthenticated | Create a new deck (owner injected from token) |
| `GET` | `/api/decks/<id>/` | IsAuthenticated | Retrieve single deck (404 for other user's deck) |
| `PUT / PATCH` | `/api/decks/<id>/` | IsAuthenticated | Update deck details (unique title per owner) |
| `DELETE` | `/api/decks/<id>/` | IsAuthenticated | Delete deck and all cards (CASCADE) |
| `GET` | `/api/decks/<id>/study/`| IsAuthenticated | Unpaginated study queue of due cards (up to 20) |
| `GET` | `/api/cards/?deck=<id>` | IsAuthenticated | Paginated list of cards in deck (10 per page) |
| `POST` | `/api/cards/` | IsAuthenticated | Create card in owner's deck (validated) |
| `GET` | `/api/cards/<id>/` | IsAuthenticated | Retrieve card details |
| `PUT / PATCH` | `/api/cards/<id>/` | IsAuthenticated | Update card front, back, hint (box is read-only) |
| `DELETE` | `/api/cards/<id>/` | IsAuthenticated | Delete single card |
| `POST` | `/api/cards/<id>/review/`| IsAuthenticated | Submit review answer (`{"correct": true/false}`) |
| `GET` | `/api/stats/` | IsAuthenticated | Aggregated stats (cards, boxes 1-5, accuracy) |

---

## Linked Frontend Repository
Frontend client repository: [FlashDeck Frontend](../frontend/)
