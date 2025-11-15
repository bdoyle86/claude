/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#00FF85",
        "background-light": "#f6f7f8",
        "background-dark": "#0A1931",
        "accent-pink": "#FF35A5",
        "accent-yellow": "#FFD700",
        "accent-purple": "#BE38F3",
        "accent-blue": "#38BDF3",
        "accent-gold": "#F3BE38",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        bangers: ["Bangers", "cursive"],
        bungee: ["Bungee", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        'neon-green': '0 0 12px 2px rgba(53, 255, 105, 0.4)',
        'neon-pink': '0 0 12px 2px rgba(255, 53, 165, 0.4)',
      },
    },
  },
  plugins: [],
}
