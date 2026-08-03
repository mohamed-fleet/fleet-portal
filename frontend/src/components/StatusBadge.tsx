import React from "react";

const statusMap: Record<string, { label: string; classes: string }> = {
  active: { label: "نشطة", classes: "bg-route/10 text-route" },
  maintenance: { label: "تحت الصيانة", classes: "bg-signal/10 text-signal" },
  inactive: { label: "متوقفة", classes: "bg-alert/10 text-alert" },
};

export default function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-steel text-xs">—</span>;
  const info = statusMap[status] ?? { label: status, classes: "bg-steel/10 text-steel" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${info.classes}`}>
      {info.label}
    </span>
  );
}
