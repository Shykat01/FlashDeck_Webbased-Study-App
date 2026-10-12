import React from "react";
import { Link } from "react-router-dom";
import BoxBadge from "./BoxBadge";
import { Edit2, HelpCircle, Trash2 } from "lucide-react";

export function formatDueTime(nextReviewAt) {
  if (!nextReviewAt) return "due now";
  const now = new Date();
  const due = new Date(nextReviewAt);
  const diffMs = due - now;

  if (diffMs <= 0) {
    return { text: "due now", isDue: true };
  }

  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return { text: `in ${diffHours}h`, isDue: false };
  }

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return { text: "in 1 day", isDue: false };
  }
  return { text: `in ${diffDays} days`, isDue: false };
}

export default function CardRow({ card, onDelete }) {
  const dueInfo = formatDueTime(card.next_review_at);

  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50/70 transition-colors">
      {/* Front / Question */}
      <td className="py-4 px-4 sm:px-6 align-top">
        <div className="font-semibold text-stone-900 text-sm leading-snug">
          {card.front}
        </div>
        {card.hint && (
          <div className="mt-1 flex items-center space-x-1 text-xs text-stone-500">
            <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="italic">Hint: {card.hint}</span>
          </div>
        )}
      </td>

      {/* Truncated Back / Answer */}
      <td className="py-4 px-4 sm:px-6 align-top hidden md:table-cell">
        <div className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
          {card.back}
        </div>
      </td>

      {/* Box Badge */}
      <td className="py-4 px-3 align-top whitespace-nowrap">
        <BoxBadge box={card.box} />
      </td>

      {/* Due status */}
      <td className="py-4 px-3 align-top whitespace-nowrap">
        {dueInfo.isDue ? (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>due now</span>
          </span>
        ) : (
          <span className="text-xs font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            {dueInfo.text}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="py-4 px-4 sm:px-6 align-top text-right whitespace-nowrap">
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/cards/${card.id}/edit`}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Edit Card"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(card)}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
