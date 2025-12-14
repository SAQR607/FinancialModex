/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'modex-dark': '#1A2C55',
        'modex-light': '#446ED0',
        'modex-teal': '#40A0AD',
        'modex-white': '#FFFFFF',
        'border': '#E5E7EB',
      },
      fontFamily: {
        'stolzl': ['Stolzl', 'sans-serif'],
        'arabic': ['Frutiger LT Arabic', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

