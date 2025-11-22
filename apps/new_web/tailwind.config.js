/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: '#390364',
        'tsf-purple': '#6B2D8F',
        'tsf-gray': '#9E9E9E',
      },
      backdropBlur: {
        '8': '8px',
        '12': '12px',
      },
    },
  },
  plugins: [],
}