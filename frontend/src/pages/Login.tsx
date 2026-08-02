import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("admin@fleet.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch {
      setError(t("login.errorInvalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-asphalt">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-xl font-display font-bold mb-1">{t("login.title")}</h1>
        <p className="text-steel text-sm mb-6">{t("login.subtitle")}</p>

        <label className="block text-xs text-steel mb-1" htmlFor="email">{t("login.email")}</label>
        <input
          id="email"
          type="email"
          className="w-full border border-black/10 rounded-md px-3 py-2 text-sm mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-xs text-steel mb-1" htmlFor="password">{t("login.password")}</label>
        <input
          id="password"
          type="password"
          className="w-full border border-black/10 rounded-md px-3 py-2 text-sm mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-alert text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-fog rounded-md py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {loading ? t("login.submitting") : t("login.submit")}
        </button>

        <p className="text-xs text-steel mt-4 font-mono">{t("login.demo")}</p>
      </form>
    </div>
  );
}
