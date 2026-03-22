/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0D3B66',
          dark: '#092D4F',
          light: '#154E87',
        },
        accent: {
          DEFAULT: '#EE964B',
          dark: '#D4803B',
        },
        highlight: '#F4D35E',
        cream: '#FAF0CA',
        surface: {
          DEFAULT: '#0D3B66',
          secondary: '#0F4475',
          tertiary: '#123A5C',
          light: '#FFFFFF',
          'light-alt': '#F5F0E6',
        },
        navy: '#0D3B66',
        success: '#7CDE7C',
        danger: '#F95738',
        warning: '#F4D35E',
        info: '#5BA4D9',
      },
      fontFamily: {
        heading: ['NauryzRedKeds', 'system-ui', 'sans-serif'],
        body: ['-apple-system', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
