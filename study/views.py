from datetime import timedelta
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Deck, Card
from .serializers import RegisterSerializer, DeckSerializer, CardSerializer

# Review ladder intervals in days as required in B-5
INTERVALS = {1: 0, 2: 1, 3: 3, 4: 7, 5: 16}


class RegisterView(generics.CreateAPIView):
    """Register a new user account with validated credentials."""
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class DeckViewSet(viewsets.ModelViewSet):
    """
    CRUD viewset for Decks, strictly scoped to the authenticated owner.
    """
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["subject", "is_archived"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        now = timezone.now()
        return (
            Deck.objects.filter(owner=self.request.user)
            .annotate(
                card_count=Count("cards", distinct=True),
                due_count=Count("cards", filter=Q(cards__next_review_at__lte=now), distinct=True),
            )
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["get"], url_path="study")
    def study(self, request, pk=None):
        """
        Unpaginated study session endpoint returning up to 20 cards due now.
        Returns 404 if deck is not owned by the caller.
        """
        deck = self.get_object()
        now = timezone.now()
        due_cards_qs = deck.cards.filter(next_review_at__lte=now).order_by("next_review_at")
        total_due = due_cards_qs.count()
        session_cards = list(due_cards_qs[:20])

        serializer = CardSerializer(session_cards, many=True, context={"request": request})
        return Response({
            "deck": {"id": deck.id, "title": deck.title},
            "due_count": total_due,
            "cards": serializer.data,
        })


class CardViewSet(viewsets.ModelViewSet):
    """
    CRUD viewset for Cards, scoped through deck ownership.
    """
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["deck", "box"]
    search_fields = ["front", "back"]
    ordering_fields = ["created_at", "box", "next_review_at"]
    ordering = ["box", "next_review_at"]

    def get_queryset(self):
        return Card.objects.filter(deck__owner=self.request.user).select_related("deck")

    @action(detail=True, methods=["post"], url_path="review")
    def review(self, request, pk=None):
        """
        Spaced repetition review action advancing cards along Leitner boxes.
        """
        card = self.get_object()  # 404 for someone else's card
        correct = request.data.get("correct")

        if not isinstance(correct, bool):
            return Response(
                {"correct": ["This field is required and must be true or false."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Leitner box ladder logic
        card.box = min(card.box + 1, 5) if correct else 1
        card.next_review_at = timezone.now() + timedelta(days=INTERVALS[card.box])
        card.last_reviewed_at = timezone.now()
        card.times_reviewed += 1
        if correct:
            card.times_correct += 1
        card.save()

        return Response(self.get_serializer(card).data)


class StatsView(APIView):
    """
    Aggregated study statistics for the logged-in user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cards = Card.objects.filter(deck__owner=request.user)
        rows = cards.values("box").annotate(n=Count("id"))
        boxes = {str(i): 0 for i in range(1, 6)}
        for row in rows:
            boxes[str(row["box"])] = row["n"]

        totals = cards.aggregate(r=Sum("times_reviewed"), c=Sum("times_correct"))
        reviewed, correct = totals["r"] or 0, totals["c"] or 0

        return Response({
            "decks": Deck.objects.filter(owner=request.user).count(),
            "cards": cards.count(),
            "due_now": cards.filter(next_review_at__lte=timezone.now()).count(),
            "mastered": boxes["5"],
            "reviewed_today": cards.filter(last_reviewed_at__date=timezone.localdate()).count(),
            "accuracy": round(100 * correct / reviewed) if reviewed else 0,
            "boxes": boxes,
        })
