import React from "react";

const statusConfig: Record<string, { label: string; classes: string }> = {
  active: { label: "نشطة", classes: "bg-route/10 text-route" },
  maintenance: { label: "تحت الصيانة", classes: "bg-signal/10 text-signal" },
  inactive: { label: "متوقفة", classes: "bg-alert/10 text-alert" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, classes: "bg-steel/10 text-steel" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}
