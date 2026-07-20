/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          card:    '#16162a',
          hover:   '#1e1e35',
          border:  '#2a2a45',
        },
        accent: {
          cyan:   '#06b6d4',
          violet: '#8b5cf6',
          amber:  '#f59e0b',
          rose:   '#f43f5e',
          emerald:'#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-card':  'linear-gradient(160deg, #16162a 0%, #1a1a2e 100%)',
        'gradient-hero':  'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.25) 0%, transparent 70%), radial-gradient(ellipse at 0% 80%, rgba(139,92,246,0.20) 0%, transparent 60%)',
      },
      boxShadow: {
        glow:    '0 0 24px rgba(99,102,241,0.4)',
        'glow-sm': '0 0 12px rgba(99,102,241,0.25)',
        card:    '0 4px 24px rgba(0,0,0,0.45)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
