/** @type {import('tailwindcss').Config} */
export default {
  // IMPORTANT: "class" strategy lets ThemeContext toggle dark mode
  // by adding/removing the "dark" class on <html>
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        // Serenio design tokens — use these in components
        serenio: {
          accent:      "#E8845A",
          "accent-hover": "#D4744A",
          // Light mode
          "bg-light":   "#FAF7F2",
          "card-light": "#FFFFFF",
          "text-light": "#2D2D2D",
          "muted-light":"#9B9692",
          "border-light":"#EEEBE4",
          "sidebar-light":"#FFFFFF",
          // Dark mode
          "bg-dark":    "#1C1A17",
          "card-dark":  "#2A2723",
          "text-dark":  "#EDE8DF",
          "muted-dark": "#6B6560",
          "border-dark":"#3A3730",
          "sidebar-dark":"#232018",
        },
      },
    },
  },
  plugins: [],
}