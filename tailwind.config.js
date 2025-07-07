/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      'sans': ["Comic Neue", "cursive", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E27A4A',
          dark: '#C85A3A'
        }
      }
    },
  },
  plugins: [],
}

