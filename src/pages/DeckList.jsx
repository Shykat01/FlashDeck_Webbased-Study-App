import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listDecks, deleteDeck } from "../api/decks";
import DeckCard from "../components/DeckCard";
import ConfirmModal from "../components/ConfirmModal";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import {
  Layers,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SUBJECT_OPTIONS = [
  { value: "", label: "All Subjects" },
  { value: "PROGRAMMING", label: "Programming" },
  { value: "LANGUAGE", label: "Language" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OTHER", label: "Other" },
];

export default function DeckList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const subject = searchParams.get("subject") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Delete modal state
  const [deletingDeck, setDeletingDeck] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDecks = async (currPage = page) => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        page: currPage,
        ...(search ? { search } : {}),
        ...(subject ? { subject } : {}),
      };
      const res = await listDecks(params);
      setData(res);
    } catch (err) {
      if (err.response?.status === 404 && currPage > 1) {
        // Reset to page 1 if out-of-range as specified in spec
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
    fetchDecks(page);
  }, [search, subject, page]);

  // Handle Search Input Change (Debounced / sync with params and reset to page 1)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("search", val);
      else next.delete("search");
      next.set("page", "1"); // Resets to page 1
      return next;
    });
  };

  // Handle Subject Select Change
  const handleSubjectChange = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("subject", val);
      else next.delete("subject");
      next.set("page", "1"); // Resets to page 1
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

  // Delete confirmation & action
  const confirmDeleteDeck = async () => {
    if (!deletingDeck) return;
    setIsDeleting(true);
    try {
      await deleteDeck(deletingDeck.id);

      // F-7: If deleted row was the last one on page, go back one page
      const remainingOnPage = data.results.length - 1;
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
        fetchDecks(targetPage);
      }

      setDeletingDeck(null);
    } catch (err) {
      alert("Failed to delete deck. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil((data.count || 0) / 10);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Study Decks
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage your card collections and spaced-repetition schedules.
          </p>
        </div>

        <Link
          to="/decks/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New deck</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search deck title or description..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors"
          />
        </div>

        {/* Subject Dropdown */}
        <div className="relative w-full md:w-56 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={subject}
            onChange={handleSubjectChange}
            aria-label="Filter decks by subject"
            className="w-full pl-10 pr-8 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors appearance-none cursor-pointer text-stone-700 font-medium"
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <Loader text="Loading your decks..." />
      ) : error ? (
        <ErrorState
          title="Could not load decks"
          message="Failed to retrieve decks from backend. Please ensure the API is running."
          onRetry={() => fetchDecks(page)}
        />
      ) : data.results.length === 0 ? (
        search || subject ? (
          <EmptyState
            icon={Search}
            title="No matching decks found"
            message={`No decks found matching "${search || subject}". Try adjusting your filters.`}
            actionLabel="Clear Filters"
            onAction={() => setSearchParams({})}
          />
        ) : (
          <EmptyState
            icon={Layers}
            title="No decks created yet"
            message="Create your first deck to start adding flashcards and building study sessions."
            actionLabel="Create Deck"
            onAction={() => window.location.assign("/decks/new")}
          />
        )
      ) : (
        <div className="space-y-6">
          {/* Deck Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.results.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onDelete={(d) => setDeletingDeck(d)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <span className="text-xs text-stone-500 font-mono">
                Showing page {page} of {totalPages} ({data.count} decks total)
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

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-7 h-7 text-xs font-semibold rounded-lg transition-colors ${
                        p === page
                          ? "bg-stone-900 text-white font-bold"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

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

      {/* Confirmation Modal for Deck Deletion (F-7) */}
      <ConfirmModal
        isOpen={!!deletingDeck}
        onClose={() => setDeletingDeck(null)}
        onConfirm={confirmDeleteDeck}
        title="Delete this deck?"
        message={`Delete "${deletingDeck?.title}" and all ${deletingDeck?.card_count || 0} cards in it? This cannot be undone.`}
        confirmText="Delete Deck"
        isDeleting={isDeleting}
      />
    </div>
  );
}
