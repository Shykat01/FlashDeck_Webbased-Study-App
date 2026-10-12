from datetime import timedelta
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from study.models import Deck, Card, Subject


class FlashDeckApiTests(APITestCase):
    def setUp(self):
        # Create User A
        self.user_a = User.objects.create_user(
            username="usera",
            email="usera@example.com",
            password="password123",
        )
        # Create User B
        self.user_b = User.objects.create_user(
            username="userb",
            email="userb@example.com",
            password="password123",
        )

        # Obtain JWT tokens
        login_url = reverse("login")
        res_a = self.client.post(login_url, {"username": "usera", "password": "password123"})
        self.token_a = res_a.data["access"]

        res_b = self.client.post(login_url, {"username": "userb", "password": "password123"})
        self.token_b = res_b.data["access"]

        # Deck for User A
        self.deck_a = Deck.objects.create(
            owner=self.user_a,
            title="User A Django Deck",
            description="Django test deck",
            subject=Subject.PROGRAMMING,
        )

        # Card for User A
        self.card_a = Card.objects.create(
            deck=self.deck_a,
            front="What is Django ORM?",
            back="An Object-Relational Mapper for Python and SQL.",
            hint="ORM",
            box=1,
            next_review_at=timezone.now() - timedelta(hours=1),
        )

    def test_01_registration_success_and_no_password_echo(self):
        """POST /api/register/ registers user without returning password."""
        register_url = reverse("register")
        payload = {
            "username": "newstudent",
            "email": "newstudent@example.com",
            "password": "securepass123",
        }
        response = self.client.post(register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["username"], "newstudent")
        self.assertNotIn("password", response.data)

        # Ensure user can log in with registered password
        login_response = self.client.post(reverse("login"), {
            "username": "newstudent",
            "password": "securepass123",
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)

    def test_02_login_bad_credentials(self):
        """POST /api/login/ with bad credentials returns 401."""
        response = self.client.post(reverse("login"), {
            "username": "usera",
            "password": "wrongpassword",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)

    def test_03_unauthenticated_requests_return_401(self):
        """GET /api/decks/ without a token returns 401."""
        response = self.client.get(reverse("deck-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_04_owner_isolation_deck_returns_404(self):
        """User B requesting User A's deck ID returns 404, not 403 or data."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        detail_url = reverse("deck-detail", kwargs={"pk": self.deck_a.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_05_cannot_post_card_into_another_users_deck(self):
        """As User B, POST /api/cards/ with User A's deck returns 400 under deck key."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        payload = {
            "deck": self.deck_a.id,
            "front": "Intrusion card",
            "back": "Should fail",
        }
        response = self.client.post(reverse("card-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("deck", response.data)

    def test_06_patch_card_box_is_ignored(self):
        """PATCH /api/cards/<id>/ with {"box": 5} does not alter the box."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        card_url = reverse("card-detail", kwargs={"pk": self.card_a.id})
        response = self.client.patch(card_url, {"box": 5, "front": "Updated front"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.card_a.refresh_from_db()
        self.assertEqual(self.card_a.box, 1)  # Server-owned: remains unchanged
        self.assertEqual(self.card_a.front, "Updated front")

    def test_07_deck_duplicate_title_for_same_user_returns_400(self):
        """Two decks with identical case-insensitive title for same user returns 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        payload = {
            "title": "user a django deck",  # Case-insensitive duplicate of existing deck
            "subject": Subject.PROGRAMMING,
        }
        response = self.client.post(reverse("deck-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_08_review_ladder_correct_advances_and_box_5_caps(self):
        """Correct review advances box and updates next_review_at; Box 5 caps at 5."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        review_url = reverse("card-review", kwargs={"pk": self.card_a.id})

        # From box 1 -> box 2 (+1 day)
        res1 = self.client.post(review_url, {"correct": True}, format="json")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.card_a.refresh_from_db()
        self.assertEqual(self.card_a.box, 2)
        self.assertEqual(self.card_a.times_reviewed, 1)
        self.assertEqual(self.card_a.times_correct, 1)

        # Manually promote to box 5 to test capping
        self.card_a.box = 5
        self.card_a.save()

        res2 = self.client.post(review_url, {"correct": True}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.card_a.refresh_from_db()
        self.assertEqual(self.card_a.box, 5)  # Stays at 5, does not become 6

    def test_09_review_ladder_incorrect_resets_to_box_1(self):
        """Incorrect review drops card directly back to box 1 and sets due immediately."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        review_url = reverse("card-review", kwargs={"pk": self.card_a.id})

        # Advance to box 4 first
        self.card_a.box = 4
        self.card_a.save()

        # Miss the card
        response = self.client.post(review_url, {"correct": False}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.card_a.refresh_from_db()
        self.assertEqual(self.card_a.box, 1)
        self.assertEqual(self.card_a.times_reviewed, 1)
        self.assertEqual(self.card_a.times_correct, 0)
        self.assertTrue(self.card_a.next_review_at <= timezone.now() + timedelta(seconds=5))

    def test_10_review_invalid_or_missing_boolean_returns_400(self):
        """Missing or non-boolean correct value returns 400, not 500."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        review_url = reverse("card-review", kwargs={"pk": self.card_a.id})

        # Missing body
        res_empty = self.client.post(review_url, {})
        self.assertEqual(res_empty.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("correct", res_empty.data)

        # String "false"
        res_str = self.client.post(review_url, {"correct": "false"})
        self.assertEqual(res_str.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("correct", res_str.data)

    def test_11_study_session_endpoint(self):
        """GET /api/decks/<id>/study/ returns unpaginated due cards; empty session is 200."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        study_url = reverse("deck-study", kwargs={"pk": self.deck_a.id})
        response = self.client.get(study_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("deck", response.data)
        self.assertIn("due_count", response.data)
        self.assertIn("cards", response.data)
        self.assertEqual(len(response.data["cards"]), 1)

        # User B trying to study User A's deck gets 404
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_b}")
        res_b = self.client.get(study_url)
        self.assertEqual(res_b.status_code, status.HTTP_404_NOT_FOUND)

    def test_12_stats_endpoint_on_new_and_active_user(self):
        """Stats endpoint handles brand-new user with 0 division and returns all 5 box keys."""
        # Brand new user test
        new_user = User.objects.create_user(username="cleanuser", password="password123")
        res_login = self.client.post(reverse("login"), {"username": "cleanuser", "password": "password123"})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res_login.data['access']}")

        res_stats = self.client.get(reverse("stats"))
        self.assertEqual(res_stats.status_code, status.HTTP_200_OK)
        self.assertEqual(res_stats.data["accuracy"], 0)
        self.assertEqual(res_stats.data["decks"], 0)
        self.assertEqual(res_stats.data["cards"], 0)
        for i in range(1, 6):
            self.assertIn(str(i), res_stats.data["boxes"])
            self.assertEqual(res_stats.data["boxes"][str(i)], 0)
