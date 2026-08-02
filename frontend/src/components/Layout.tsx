import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: "🏠" },
    { to: "/vehicles", label: t("nav.vehicles"), icon: "🚗" },
    { to: "/drivers", label: t("nav.drivers"), icon: "🧑" },
    { to: "/trips", label: t("nav.trips"), icon: "🛣" },
  ];

  const isArabic = i18n.language === "ar";

  useEffect(() => {
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
    localStorage.setItem("lang", i18n.language);
  }, [i18n.language, isArabic]);

  const toggleLanguage = () => {
    i18n.changeLanguage(isArabic ? "en" : "ar");
  };

  return (
    <div className="min-h-screen flex bg-fog">
      <aside className="w-60 bg-asphalt text-fog flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-display font-bold text-lg tracking-tight">بوابة الأسطول</p>
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
        <button
          onClick={toggleLanguage}
          className="mx-3 mb-3 px-3 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          {isArabic ? "English" : "العربية"}
        </button>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/40 font-mono">
          {t("nav.version")}
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
