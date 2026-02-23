export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        }
      },
      animation: {
        shine: 'shine 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
