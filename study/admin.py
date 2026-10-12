from django.contrib import admin
from .models import Deck, Card


@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "subject", "is_archived", "created_at")
    list_filter = ("subject", "is_archived", "created_at")
    search_fields = ("title", "description", "owner__username")


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("front_preview", "deck", "box", "next_review_at", "last_reviewed_at")
    list_filter = ("box", "deck", "next_review_at")
    search_fields = ("front", "back", "hint", "deck__title")

    @admin.display(description="Question")
    def front_preview(self, obj):
        return obj.front[:40]
