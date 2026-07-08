/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1B3580',
          orange: '#F07B1B',
          red: '#E2231A',
        },
      },
    },
  },
  plugins: [],
}
