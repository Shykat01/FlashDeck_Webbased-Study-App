import React from "react";

export default function StatCard({ title, value, unit, icon: Icon, colorClass, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass || "bg-stone-100 text-stone-600"}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-1">
        <span className="text-3xl font-bold tracking-tight text-stone-900 font-mono">
          {value !== undefined && value !== null ? value : "—"}
        </span>
        {unit && <span className="text-stone-500 font-medium text-sm">{unit}</span>}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-stone-500 truncate">{subtitle}</p>
      )}
    </div>
  );
}
