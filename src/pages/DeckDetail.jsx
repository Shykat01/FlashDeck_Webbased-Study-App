import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getDeck } from "../api/decks";
import { listCards, deleteCard } from "../api/cards";
import CardRow from "../components/CardRow";
import ConfirmModal from "../components/ConfirmModal";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Play,
  Plus,
  Search,
  BookOpen,
} from "lucide-react";

const BOX_FILTER_OPTIONS = [
  { value: "", label: "Box: All" },
  { value: "1", label: "Box 1 (Today)" },
  { value: "2", label: "Box 2 (+1d)" },
  { value: "3", label: "Box 3 (+3d)" },
  { value: "4", label: "Box 4 (+7d)" },
  { value: "5", label: "Box 5 (Mastered)" },
];

export default function DeckDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const box = searchParams.get("box") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [deck, setDeck] = useState(null);
  const [cardData, setCardData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Card deletion state
  const [deletingCard, setDeletingCard] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (currPage = page) => {
    setLoading(true);
    setError(false);
    try {
      const [deckRes, cardsRes] = await Promise.all([
        getDeck(id),
        listCards({
          deck: id,
          page: currPage,
          ...(search ? { search } : {}),
          ...(box ? { box } : {}),
        }),
      ]);
      setDeck(deckRes);
      setCardData(cardsRes);
    } catch (err) {
      if (err.response?.status === 404 && currPage > 1) {
        // Reset to page 1 if out-of-range
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("page", "1");
          return next;
        });
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [id, search, box, page]);

  // Handle Search Input Change (Resets to page 1)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("search", val);
      else next.delete("search");
      next.set("page", "1");
      return next;
    });
  };

  // Handle Box Filter Select (Resets to page 1)
  const handleBoxChange = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("box", val);
      else next.delete("box");
      next.set("page", "1");
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
  };

  // Confirm card deletion
  const confirmDeleteCard = async () => {
    if (!deletingCard) return;
    setIsDeleting(true);
    try {
      await deleteCard(deletingCard.id);

      // F-7: If deleted row was the last one on page, go back one page
      const remainingOnPage = cardData.results.length - 1;
      let targetPage = page;
      if (remainingOnPage === 0 && page > 1) {
        targetPage = page - 1;
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("page", String(targetPage));
          return next;
        });
      } else {
        // Refetch current page
        loadData(targetPage);
      }

      setDeletingCard(null);
    } catch (err) {
      alert("Failed to delete card. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil((cardData.count || 0) / 10);

  if (loading && !deck) {
    return <Loader fullScreen text="Loading deck cards..." />;
  }

  if (error && !deck) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <ErrorState
          title="Could not load this deck."
          message="Failed to retrieve deck details from server."
          onRetry={() => loadData(page)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500">
        <Link
          to="/decks"
          className="inline-flex items-center space-x-1 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Decks</span>
        </Link>
        <span>/</span>
        <span className="text-stone-900 truncate max-w-xs">{deck?.title}</span>
      </div>

      {/* Top Deck Info Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-stone-100 text-stone-600">
              {deck?.subject}
            </span>
            <span className="text-xs font-mono text-stone-400">
              {cardData.count} {cardData.count === 1 ? "card" : "cards"}
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {deck?.title}
          </h1>
          {deck?.description && (
            <p className="mt-2 text-sm text-stone-600 max-w-2xl leading-relaxed">
              {deck.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <Link
            to={`/decks/${id}/cards/new`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add card</span>
          </Link>

          {deck?.due_count > 0 ? (
            <Link
              to={`/decks/${id}/study`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Study ({deck.due_count})</span>
            </Link>
          ) : (
            <Link
              to={`/decks/${id}/study`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
              title="No cards due today"
            >
              <Play className="w-4 h-4" />
              <span>Study (0)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search front or back..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors"
          />
        </div>

        {/* Box Filter */}
        <div className="relative w-full sm:w-48 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={box}
            onChange={handleBoxChange}
            aria-label="Filter cards by Leitner box"
            className="w-full pl-10 pr-8 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors appearance-none cursor-pointer text-stone-700 font-medium"
          >
            {BOX_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Table or States */}
      {loading ? (
        <Loader text="Loading cards..." />
      ) : error ? (
        <ErrorState
          title="Could not load this deck."
          message="Failed to retrieve cards for this deck. Check your backend server."
          onRetry={() => loadData(page)}
        />
      ) : cardData.results.length === 0 ? (
        search || box ? (
          <EmptyState
            icon={Search}
            title="No cards match this filter"
            message={`No flashcards found matching the selected query. Try clearing filters.`}
            actionLabel="Reset Filters"
            onAction={() => setSearchParams({})}
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No cards in this deck yet"
            message="Add your first question and answer card to begin using spaced repetition."
            actionLabel="Add First Card"
            onAction={() => window.location.assign(`/decks/${id}/cards/new`)}
          />
        )
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Question (Front)</th>
                  <th className="py-3 px-4 sm:px-6 hidden md:table-cell">Answer (Back)</th>
                  <th className="py-3 px-3">Box</th>
                  <th className="py-3 px-3">Next Due</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cardData.results.map((card) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    onDelete={(c) => setDeletingCard(c)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-stone-50/60 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">
                Page {page} of {totalPages} ({cardData.count} cards)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Card Deletion (F-7) */}
      <ConfirmModal
        isOpen={!!deletingCard}
        onClose={() => setDeletingCard(null)}
        onConfirm={confirmDeleteCard}
        title="Delete this flashcard?"
        message={`Delete "${deletingCard?.front?.slice(0, 50)}..."? This cannot be undone.`}
        confirmText="Delete Card"
        isDeleting={isDeleting}
      />
    </div>
  );
}
