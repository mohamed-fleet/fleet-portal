/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12181B",         // near-black, for text/headers
        asphalt: "#1F2A30",     // deep road-grey for surfaces
        steel: "#4A5A62",       // muted secondary text
        signal: "#E8A33D",      // amber — hazard-light accent, used sparingly
        route: "#2E8B74",       // teal-green — "active/on-route" state
        alert: "#C4483C",       // muted brick-red — maintenance/alert state
        fog: "#F4F6F5",         // page background
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
