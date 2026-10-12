import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Edit2, Play, Trash2 } from "lucide-react";

export default function DeckCard({ deck, onDelete }) {
  const isDue = deck.due_count > 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-stone-100 text-stone-600 mb-2">
              {deck.subject}
            </span>
            <Link
              to={`/decks/${deck.id}`}
              className="block font-bold text-lg text-stone-900 group-hover:text-blue-600 transition-colors truncate"
            >
              {deck.title}
            </Link>
          </div>

          {/* Due counter badge */}
          {isDue ? (
            <span className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{deck.due_count} due</span>
            </span>
          ) : (
            <span className="shrink-0 text-xs font-medium text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
              0 due
            </span>
          )}
        </div>

        {deck.description && (
          <p className="mt-2 text-sm text-stone-500 line-clamp-2 leading-relaxed">
            {deck.description}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 font-mono">
          {deck.card_count} {deck.card_count === 1 ? "card" : "cards"}
        </span>

        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {isDue ? (
            <Link
              to={`/decks/${deck.id}/study`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs"
              title="Start Study Session"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Study ({deck.due_count})</span>
            </Link>
          ) : (
            <Link
              to={`/decks/${deck.id}`}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
              title="View Cards"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cards</span>
            </Link>
          )}

          <Link
            to={`/decks/${deck.id}/edit`}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Edit Deck"
          >
            <Edit2 className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(deck)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Deck"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
