/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // blue-500
        secondary: '#10b981', // emerald-500
        dark: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900
        border: '#27272a', // zinc-800
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
