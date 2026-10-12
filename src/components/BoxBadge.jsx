import React from "react";

const BOX_CONFIG = {
  1: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    label: "Box 1",
    schedule: "Today",
  },
  2: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Box 2",
    schedule: "+1d",
  },
  3: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    label: "Box 3",
    schedule: "+3d",
  },
  4: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    label: "Box 4",
    schedule: "+7d",
  },
  5: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Box 5",
    schedule: "Mastered",
  },
};

export default function BoxBadge({ box = 1, showSchedule = false, size = "md" }) {
  const config = BOX_CONFIG[box] || BOX_CONFIG[1];
  const paddingClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-semibold rounded-md border ${config.bg} ${config.text} ${config.border} ${paddingClass}`}
      title={`Leitner Box ${box} (${config.schedule})`}
    >
      <span className="font-mono font-bold">[{box}]</span>
      <span>{config.label}</span>
      {showSchedule && (
        <span className="text-[10px] opacity-80 uppercase tracking-wider font-normal">
          • {config.schedule}
        </span>
      )}
    </span>
  );
}
