import React from "react";

export default function RiskBadge({ tier, probability, size = "md" }) {
  let colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let dotColor = "bg-emerald-500";

  const lower = (tier || "").toLowerCase();
  if (lower.includes("high") || lower.includes("positive") || lower.includes("danger")) {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
    dotColor = "bg-rose-500";
  } else if (lower.includes("moderate") || lower.includes("borderline") || lower.includes("warning")) {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
    dotColor = "bg-amber-500";
  }

  const sizeClasses = size === "lg" ? "px-4 py-1.5 text-base font-bold" : "px-3 py-1 text-xs font-semibold";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}>
      <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
      <span>{tier || "Unknown"}</span>
      {probability !== undefined && (
        <span className="opacity-75 text-[0.85em]">({Math.round(probability * 100)}%)</span>
      )}
    </span>
  );
}
