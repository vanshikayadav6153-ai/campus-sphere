/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          dark: '#001219',
          primary: '#005F73',
          teal: '#0A9396',
          sage: '#94D2BD',
          sand: '#E9D8A6',
          amber: '#EE9B00',
          rust: '#CA6702',
          crimson: '#BB3E03',
        },
      },
    },
  },
  plugins: [],
}
