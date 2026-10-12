import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "No items found",
  message = "Get started by adding your first item.",
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-6">
      <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 mx-auto flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-stone-900">{title}</h3>
      <p className="mt-1.5 text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
          >
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}
