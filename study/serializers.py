from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Deck, Card, Subject


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class DeckSerializer(serializers.ModelSerializer):
    card_count = serializers.IntegerField(read_only=True, default=0)
    due_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Deck
        fields = [
            "id",
            "title",
            "description",
            "subject",
            "is_archived",
            "card_count",
            "due_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "card_count",
            "due_count",
        ]

    def validate_title(self, value):
        user = self.context["request"].user
        qs = Deck.objects.filter(owner=user, title__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("You already have a deck with this title.")
        return value


class CardSerializer(serializers.ModelSerializer):
    deck_title = serializers.CharField(source="deck.title", read_only=True)
    is_due = serializers.SerializerMethodField()

    class Meta:
        model = Card
        fields = [
            "id",
            "deck",
            "deck_title",
            "front",
            "back",
            "hint",
            "box",
            "next_review_at",
            "last_reviewed_at",
            "times_reviewed",
            "times_correct",
            "is_due",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "deck_title",
            "box",
            "next_review_at",
            "last_reviewed_at",
            "times_reviewed",
            "times_correct",
            "is_due",
            "created_at",
            "updated_at",
        ]

    def get_is_due(self, obj):
        return obj.next_review_at <= timezone.now()

    def validate_deck(self, deck):
        user = self.context["request"].user
        if deck.owner != user:
            raise serializers.ValidationError("This deck does not belong to you.")
        return deck
