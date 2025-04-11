/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sage': '#5A6F57',
        'warm-white': '#F5F3EE',
        'charcoal': '#2D2D2D',
        'warm-tan': '#E2D5C3',
        'neutral-gray': '#A8A8A8',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
