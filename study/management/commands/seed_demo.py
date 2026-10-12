from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from study.models import Deck, Card, Subject


class Command(BaseCommand):
    help = "Seeds a demo user with 3 decks and ~60 cards spread across all five boxes for evaluation."

    def handle(self, *args, **options):
        username = "demo_user"
        password = "demopass123"
        email = "demo@flashdeck.local"

        user, created = User.objects.get_or_create(username=username, defaults={"email": email})
        user.set_password(password)
        user.email = email
        user.save()

        # Clean existing decks for demo user to ensure idempotent seeding
        user.decks.all().delete()

        now = timezone.now()

        # Deck 1: Django & DRF Architecture
        deck_django = Deck.objects.create(
            owner=user,
            title="Django & DRF Architecture",
            description="Core Django ORM concepts, serializers, query optimization, and REST design patterns.",
            subject=Subject.PROGRAMMING,
        )

        django_cards = [
            ("What is the primary difference between select_related and prefetch_related?",
             "select_related does a SQL JOIN for single-valued relationships (FK, 1-to-1). prefetch_related executes a separate query with an IN clause for multi-valued relations (M2M, reverse FK).",
             "SQL JOIN vs separate queries", 1, True, 2, 1),
            ("When is a Django QuerySet evaluated?",
             "QuerySets are lazy. They evaluate upon iteration, slicing with step, repr(), len(), list(), bool(), or pickling.",
             "Lazy execution", 1, True, 1, 0),
            ("Why should perform_create be overridden in a DRF ModelViewSet?",
             "To inject server-owned attributes (like request.user) into serializer.save() without relying on untrusted client request data.",
             "Server-side scoping", 2, False, 4, 3),
            ("What does APPEND_SLASH do, and why can it cause POST issues?",
             "It redirects URLs without a trailing slash to one with a slash. A 301/302 redirect turns POST into GET or drops the request body.",
             "HTTP Redirect behavior", 2, False, 3, 2),
            ("How does DRF's SerializerMethodField work?",
             "It is a read-only field whose value is calculated by calling get_<field_name>(obj) on the serializer instance.",
             "get_<field_name>", 3, False, 5, 4),
            ("What is the N+1 problem in an API endpoint?",
             "When an endpoint executes 1 query for the parent list and N additional queries for each child relation. Prevented using select_related/prefetch_related/annotate.",
             "Query explosion", 3, False, 6, 5),
            ("How do you prevent zero-division errors when calculating average accuracy in Django?",
             "Guard the division with conditional logic (e.g., if total else 0) before returning the calculated percentage.",
             "Edge case guard", 4, False, 8, 7),
            ("What is the purpose of django-cors-headers CorsMiddleware?",
             "It handles Cross-Origin Resource Sharing by intercepting OPTIONS requests and adding Access-Control-Allow-Origin headers.",
             "CORS headers", 4, False, 9, 8),
            ("Why must CorsMiddleware appear above CommonMiddleware in settings.py?",
             "So it can intercept preflight OPTIONS requests before CommonMiddleware redirects or intercepts without CORS headers.",
             "Middleware ordering", 5, False, 12, 12),
            ("What is the difference between authenticate() and login() in Django?",
             "authenticate() verifies credentials and returns a User object; login() writes the authenticated user into the current session.",
             "Verify vs Persist", 5, False, 11, 11),
            ("How does simplejwt validate access tokens?",
             "It decodes and verifies the HMAC/RSA signature and checks the expiration claim ('exp') embedded in the payload.",
             "Cryptographic signature check", 1, True, 2, 1),
            ("Why should ModelSerializer fields specify read_only_fields for server-controlled data?",
             "To ensure clients cannot forge or tamper with internal state like boxes, review timestamps, or ownership.",
             "Data protection", 1, True, 1, 0),
            ("What does annotate() do in a Django QuerySet?",
             "It adds calculated aggregate columns (like Count, Sum, Avg) to each returned database row in a single query.",
             "SQL GROUP BY", 2, False, 3, 2),
            ("What is the function of Django's bulk_create()?",
             "It inserts a list of model instances into the database using a single SQL INSERT query, bypassing per-instance save() calls.",
             "Batch insertion", 3, False, 5, 4),
            ("How does DRF handle validation errors raised in validate_<field>()?",
             "It catches ValidationError and serializes it as an HTTP 400 Bad Request with a dictionary of field error lists.",
             "HTTP 400 dictionary shape", 4, False, 7, 6),
            ("What does related_name in a ForeignKey do?",
             "It defines the reverse attribute name on the related model to access the querying set (e.g., user.decks.all()).",
             "Reverse relation access", 5, False, 10, 10),
            ("Why should timezone.now() be used over datetime.now() in Django?",
             "timezone.now() returns timezone-aware datetimes respecting settings.USE_TZ, preventing offset naive comparison errors.",
             "Timezone awareness", 1, True, 0, 0),
            ("What HTTP status code is returned when an unauthenticated request hits an IsAuthenticated view?",
             "HTTP 401 Unauthorized.",
             "Auth requirement", 2, False, 2, 2),
            ("What HTTP status is returned when an authenticated user attempts to access another user's deck?",
             "HTTP 404 Not Found (since get_queryset filters by request.user).",
             "Privacy through 404", 3, False, 4, 3),
            ("How do you configure case-insensitive uniqueness in Django ModelSerializer?",
             "Query the model with title__iexact=value for the current user, excluding self.instance.pk if editing.",
             "iexact lookup", 5, False, 8, 8),
        ]

        # Deck 2: React 18 & Frontend Architecture
        deck_react = Deck.objects.create(
            owner=user,
            title="React 18 & State Design",
            description="Hooks, reconciliation, lifecycle management, and clean async API patterns.",
            subject=Subject.INTERVIEW,
        )

        react_cards = [
            ("What is the purpose of useEffect dependency array?",
             "It declares values the effect depends on. React only re-runs the effect when one of these values changes across renders.",
             "Reference equality", 1, True, 1, 0),
            ("Why does passing an inline object to useEffect dependencies cause an infinite loop?",
             "Because every render allocates a new object reference in memory, failing shallow equality comparison (Object.is).",
             "Object reference recreation", 1, True, 2, 1),
            ("How do Axios interceptors simplify JWT token management?",
             "Request interceptors inject 'Authorization: Bearer <token>' automatically; response interceptors catch 401 errors for logout/refresh.",
             "Centralized HTTP pipeline", 2, False, 4, 3),
            ("What problem does the clean-up function in useEffect solve?",
             "It cancels pending async operations, clears timers, removes event listeners, and prevents memory leaks / race conditions.",
             "Unmount & re-run cleanup", 2, False, 3, 2),
            ("What is the difference between controlled and uncontrolled components?",
             "Controlled components have their value managed by React state; uncontrolled components maintain internal state accessed via refs.",
             "State vs DOM ref", 3, False, 5, 4),
            ("How does React Router v6 handle nested routing and protected routes?",
             "Protected routes render child components conditionally or render <Navigate to='/login' replace /> when unauthenticated.",
             "Route guards", 3, False, 6, 5),
            ("What is optimistic UI updating?",
             "Updating the client interface immediately before the server network request completes, and rolling back if it fails.",
             "Immediate responsiveness", 4, False, 7, 6),
            ("Why should Vite environment variables be prefixed with VITE_?",
             "Vite statically exposes only variables starting with VITE_ to client bundle code to avoid leaking private secrets.",
             "Secret leak prevention", 4, False, 8, 7),
            ("What is the role of React.memo?",
             "A higher-order component that skips re-rendering a component if its props have not changed according to shallow comparison.",
             "Performance memoization", 5, False, 10, 10),
            ("What is the difference between useCallback and useMemo?",
             "useCallback memoizes a function definition; useMemo memoizes the computed result of an expression.",
             "Function vs Return value", 5, False, 12, 12),
            ("How do you prevent double-submissions in React forms?",
             "Disable the submit button and set a loading flag (saving=true) in state for the duration of the async request.",
             "Button disabled state", 1, True, 1, 0),
            ("Why should you avoid hardcoding API URLs in React components?",
             "Hardcoding prevents environment flexibility between dev, test, and production. Centralize in an environment variable.",
             "Environment agility", 2, False, 3, 2),
            ("What is lifting state up in React?",
             "Moving shared state to the closest common ancestor component so multiple sibling components can access and sync it.",
             "Common ancestor", 3, False, 4, 3),
            ("How does React 18 automatic batching improve performance?",
             "React batches multiple state updates into a single re-render even inside promises, setTimeout, and native event handlers.",
             "Batch render grouping", 4, False, 6, 5),
            ("Why is window.confirm() discouraged in modern web applications?",
             "It blocks browser execution, cannot be styled or themed, lacks accessibility customization, and harms UX on mobile devices.",
             "Native blocking dialog", 5, False, 9, 9),
            ("What is the Leitner spaced repetition system?",
             "A flashcard review system where correctly answered cards advance to higher boxes with exponential intervals, and incorrect drop to Box 1.",
             "Box ladder", 1, True, 0, 0),
            ("How should field-level errors from DRF be mapped in a React form?",
             "Store the error object in state and render each array's first item directly under the corresponding input element.",
             "Per-field feedback", 2, False, 2, 1),
            ("Why should study sessions fetch the cards queue once rather than refetching per answer?",
             "Refetching per answer reshuffles the queue under the learner's feet, causing missed cards to appear abruptly.",
             "Stable study queue", 4, False, 7, 7),
            ("What is a pure component in React?",
             "A component that always renders the exact same output given the same props and state, with no observable side effects.",
             "Deterministic rendering", 5, False, 10, 10),
            ("How does CSS 3D transform create a flashcard flip effect?",
             "Using perspective, transform-style: preserve-3d, and backface-visibility: hidden with rotateY(180deg).",
             "rotateY & backface", 3, False, 5, 4),
        ]

        # Deck 3: Web Security & HTTP Protocols
        deck_security = Deck.objects.create(
            owner=user,
            title="Web Security & HTTP Protocols",
            description="CORS headers, JWT mechanics, HTTPS, status codes, and browser sandboxing.",
            subject=Subject.ACADEMIC,
        )

        security_cards = [
            ("What is the purpose of the CORS preflight OPTIONS request?",
             "Browsers send an OPTIONS request before non-simple requests to ask the server whether the actual request is permitted.",
             "Preflight permission", 1, True, 1, 0),
            ("What information is typically stored in a JWT payload?",
             "Claims such as user ID (user_id), expiration time (exp), and token type, serialized in Base64Url JSON.",
             "Claims & Expiration", 1, True, 2, 1),
            ("Why is JWT authentication considered stateless?",
             "The server does not query a session table on every request; validity is verified purely by decrypting/verifying the cryptographic signature.",
             "Signature verification", 2, False, 3, 2),
            ("What is the difference between HTTP 401 and HTTP 403?",
             "401 Unauthorized indicates unauthenticated (missing/invalid credentials); 403 Forbidden indicates authenticated but lacking permission.",
             "Who you are vs What you can do", 2, False, 4, 3),
            ("How does Cross-Site Scripting (XSS) attack an application?",
             "Malicious JavaScript is injected into the client browser, potentially reading localStorage tokens and hijacking sessions.",
             "Malicious JS injection", 3, False, 5, 4),
            ("What is Cross-Site Request Forgery (CSRF)?",
             "An unauthorized command is transmitted from a trusted user to an application where the browser automatically attaches cookies.",
             "Session forgery", 3, False, 6, 5),
            ("Why are HTTP-only cookies safer than localStorage for sensitive tokens?",
             "HTTP-only cookies cannot be accessed by client-side JavaScript, effectively neutralizing token theft via XSS.",
             "No JavaScript access", 4, False, 7, 6),
            ("What does the Content-Security-Policy (CSP) header enforce?",
             "It restricts where scripts, images, styles, and other resources can be loaded from, mitigating XSS attacks.",
             "Resource origin restriction", 4, False, 8, 7),
            ("What is an idempotent HTTP method?",
             "A method where making identical multiple requests produces the same server state as a single request (e.g., GET, PUT, DELETE).",
             "Same state outcome", 5, False, 11, 11),
            ("Why is POST not considered an idempotent method?",
             "Submitting multiple POST requests can create multiple duplicate resources on the server.",
             "Duplicate creation", 5, False, 12, 12),
            ("What is the purpose of HSTS (HTTP Strict Transport Security)?",
             "It tells browsers that the site must only be accessed over HTTPS, preventing SSL stripping attacks.",
             "Force HTTPS", 1, True, 1, 0),
            ("What does the SameSite cookie attribute control?",
             "It determines whether cookies are sent with cross-site requests, protecting against CSRF attacks.",
             "Cross-site cookie transfer", 2, False, 3, 2),
            ("What is SQL Injection, and how does Django ORM prevent it?",
             "Inserting malicious SQL into queries; Django ORM uses parameterized queries where user inputs are safely escaped.",
             "Parameterized queries", 3, False, 5, 4),
            ("What is Rate Limiting / Throttling in REST APIs?",
             "Limiting the number of requests a client can make in a specified timeframe to prevent brute force and DoS.",
             "Request frequency control", 4, False, 7, 6),
            ("What is the difference between PUT and PATCH in REST conventions?",
             "PUT replaces the entire resource representation; PATCH applies partial modifications to specific fields.",
             "Complete vs Partial update", 5, False, 10, 10),
            ("What is clickjacking, and how does X-Frame-Options prevent it?",
             "Tricking users into clicking invisible iframed elements; X-Frame-Options DENY / SAMEORIGIN forbids unauthorized framing.",
             "iFrame embedding ban", 1, True, 0, 0),
            ("Why should database passwords never be hardcoded into settings.py?",
             "Committed credentials in version control can be scraped and exploited. Use environment variables.",
             "Environment decoupling", 2, False, 2, 1),
            ("What does HTTP status code 429 indicate?",
             "Too Many Requests: the client has exceeded rate limits.",
             "Rate limit hit", 3, False, 4, 3),
            ("How does SSL/TLS encryption protect data in transit?",
             "It encrypts payloads between client and server, preventing eavesdropping and man-in-the-middle tampering.",
             "Payload encryption", 4, False, 6, 5),
            ("What is the purpose of salt in password hashing?",
             "A random string concatenated to the password before hashing to defeat precomputed rainbow table attacks.",
             "Rainbow table defense", 5, False, 10, 10),
        ]

        def create_cards_for_deck(deck, card_defs):
            created_cards = []
            for item in card_defs:
                front, back, hint, box_num, is_due, reviewed_count, correct_count = item
                if is_due:
                    # Due today: next_review_at in the past
                    next_review = now - timedelta(hours=2)
                else:
                    # Due in future: box 2 (+1 day), box 3 (+3 days), box 4 (+7 days), box 5 (+16 days)
                    days_ahead = {1: 0, 2: 1, 3: 3, 4: 7, 5: 16}.get(box_num, 1)
                    next_review = now + timedelta(days=days_ahead)

                last_rev = (now - timedelta(days=1)) if reviewed_count > 0 else None

                card = Card.objects.create(
                    deck=deck,
                    front=front,
                    back=back,
                    hint=hint,
                    box=box_num,
                    next_review_at=next_review,
                    last_reviewed_at=last_rev,
                    times_reviewed=reviewed_count,
                    times_correct=correct_count,
                )
                created_cards.append(card)
            return created_cards

        c1 = create_cards_for_deck(deck_django, django_cards)
        c2 = create_cards_for_deck(deck_react, react_cards)
        c3 = create_cards_for_deck(deck_security, security_cards)

        total_cards = len(c1) + len(c2) + len(c3)
        due_now = Card.objects.filter(deck__owner=user, next_review_at__lte=now).count()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded demo account!\n"
            f"Username: {username}\n"
            f"Password: {password}\n"
            f"Total Decks: 3\n"
            f"Total Cards: {total_cards}\n"
            f"Cards Due Right Now: {due_now}"
        ))
