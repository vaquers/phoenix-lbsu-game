/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0D3B66',
        cream: '#f5f5f0',
      },
    },
  },
  plugins: [],
}
