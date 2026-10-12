import React from "react";

export default function Loader({ text = "Loading...", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-stone-500 animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
      <p className="text-xs font-medium text-stone-500">{text}</p>
    </div>
  );
}
