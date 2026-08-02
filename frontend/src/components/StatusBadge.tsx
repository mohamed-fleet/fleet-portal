import React from "react";

// Statuses now come straight from the official vehicle-registration export
// (e.g. "صالحة", "غير صالحة") rather than a fixed enum, so we color a few
// known values and fall back to a neutral badge for anything else.
const statusColors: Record<string, string> = {
  "صالحة": "bg-route/10 text-route",
  "غير صالحة": "bg-alert/10 text-alert",
  "تحت الصيانة": "bg-signal/10 text-signal",
  "موقوفة": "bg-alert/10 text-alert",
};

export default function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-steel text-xs">—</span>;
  const classes = statusColors[status] ?? "bg-steel/10 text-steel";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}
