import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "لوحة التحكم", icon: "▣" },
  { to: "/vehicles", label: "المركبات", icon: "🚚" },
  { to: "/drivers", label: "السائقون", icon: "👤" },
  { to: "/trips", label: "الرحلات", icon: "↗" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-fog">
      <aside className="w-60 bg-asphalt text-fog flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-display font-bold text-lg tracking-tight">الأسطول</p>
          <p className="text-xs text-white/50 font-mono mt-1">FLEET CONTROL</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-signal text-ink" : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/40 font-mono">
          v0.1 — MVP
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
