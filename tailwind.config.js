module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.{css}",    // ← ajoute ce chemin
  ],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [
    require("tw-animate-css"),
  ],
};
