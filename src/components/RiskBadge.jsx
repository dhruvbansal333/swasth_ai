import React from "react";

export default function RiskBadge({ tier, probability, size = "md", showDot = true }) {
  let colorClasses = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
  let dotColor = "bg-emerald-500";
  let glowColor = "shadow-emerald-500/20";

  const lower = (tier || "").toLowerCase();
  if (lower.includes("high") || lower.includes("danger") || lower.includes("critical")) {
    colorClasses = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
    dotColor = "bg-rose-500";
    glowColor = "shadow-rose-500/25";
  } else if (lower.includes("moderate") || lower.includes("borderline") || lower.includes("warning")) {
    colorClasses = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    dotColor = "bg-amber-500";
    glowColor = "shadow-amber-500/20";
  }

  const sizeClasses =
    size === "lg"
      ? "px-3.5 py-1.5 text-sm font-semibold tracking-tight"
      : size === "sm"
      ? "px-2 py-0.5 text-[10px] font-medium"
      : "px-2.5 py-1 text-xs font-semibold tracking-tight";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-xs shadow-xs ${glowColor} ${colorClasses} ${sizeClasses}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      <span>{tier || "Stratified"}</span>
      {probability !== undefined && (
        <span className="font-mono opacity-80 text-[0.9em]">
          {(probability * 100).toFixed(1)}%
        </span>
      )}
    </span>
  );
}
