/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        card: '#1a1d27',
        card2: '#1e2130',
        border: '#2a2d3e',
        accent: '#6366f1',
      },
    },
  },
  plugins: [],
};
