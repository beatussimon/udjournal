/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // University of Dar es Salaam (UDSM) Official Brand Colors
        udsm: {
          // Primary: UDSM Blue - Official university blue
          primary: '#1e3a8a',
          primaryLight: '#2563eb',
          primaryDark: '#1e40af',
          // Secondary: Supporting blue tones
          secondary: '#1e40af',
          secondaryLight: '#3b82f6',
          secondaryDark: '#1d4ed8',
          // Accent: Gold/Yellow for highlights
          accent: '#f59e0b',
          accentLight: '#fbbf24',
          accentDark: '#d97706',
          // Light backgrounds
          light: '#f8fafc',
          lightBlue: '#dbeafe',
          // Dark backgrounds
          dark: '#0f172a',
          darkSecondary: '#1e293b',
          // Neutral grays
          gray: '#64748b',
          grayLight: '#94a3b8',
          grayDark: '#475569',
          // Status colors
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          // Gold for academic prestige
          gold: '#f59e0b',
          goldLight: '#fcd34d',
        },
      },
      fontFamily: {
        sans: ['Source Sans 3', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Libre Baskerville', 'Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s infinite',
        'counter': 'counter 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        counter: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
