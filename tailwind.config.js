/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cipam: {
          navy: '#0f172a',
          blue: '#1e3a8a',
          accent: '#2563eb',
          gold: '#f59e0b',
          emerald: '#10b981',
          purple: '#8b5cf6',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          amber: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-4%)' },
          '50%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px #3b82f6, 0 0 20px #3b82f6' },
          'to': { boxShadow: '0 0 20px #60a5fa, 0 0 35px #60a5fa' },
        }
      }
    },
  },
  plugins: [],
}
