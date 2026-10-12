import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "Could not load this deck.",
  onRetry,
}) {
  return (
    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-8 sm:p-10 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900">{title}</h3>
      <p className="mt-1.5 text-sm text-rose-700 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 active:bg-rose-100 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
}
