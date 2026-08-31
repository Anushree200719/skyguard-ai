/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070a12',
          800: '#0e1626',
          700: '#172339',
          600: '#233454'
        },
        skyguard: {
          cyan: '#38bdf8',
          blue: '#0284c7',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
          indigo: '#6366f1'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        sans: ['Rajdhani', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
