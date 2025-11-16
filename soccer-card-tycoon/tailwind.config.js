/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#32CD32",
        "background-light": "#f5f7f8",
        "background-dark": "#01091C",
        "accent-purple": "#BE38F3",
        "accent-blue": "#38BDF3",
        "accent-gold": "#F3BE38",
        "common-gray": "#9CA3AF",
        "hot-pink": "#FF1493",
        "electric-blue": "#00FFFF",
        "neon-pink": "#FF00FF",
        "bright-cyan": "#00FFFF",
        "electric-purple": "#8A2BE2",
        "vibrant-green": "#39FF14",
        "bright-yellow": "#FFC700",
      },
      fontFamily: {
        "display": ["Bungee", "sans-serif"],
        "pixel": ["'Press Start 2P'", "cursive"],
        "body": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      boxShadow: {
        'pixel-hard': '4px 4px 0px 0px #000',
        'pixel-hard-sm': '2px 2px 0px 0px #000',
        'pixel-hard-white': '4px 4px 0px 0px #FFFFFF',
        'pixel-hard-inset': 'inset 2px 2px 0px 0px #000',
      },
    },
  },
  plugins: [],
}
