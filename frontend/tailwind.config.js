/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./templates/frontend/*.html",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          black: "#121212",
          dark: "#181818",
          light: "#282828",
        },
        midnight: {
          900: "#020617",
          800: "#1e293b",
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
