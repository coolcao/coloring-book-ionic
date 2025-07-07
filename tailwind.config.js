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
          DEFAULT: '#4A90E2',
          dark: '#3A7BC8'
        }
      }
    },
  },
  plugins: [],
}

