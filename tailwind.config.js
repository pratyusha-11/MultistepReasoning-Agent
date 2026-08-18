/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fafaf9',
        slateink: '#0f172a',
        scout: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        pilot: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        amberline: {
          100: '#fef3c7',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
      boxShadow: {
        soft: '0 2px 12px rgba(15, 23, 42, 0.06)',
        lift: '0 12px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
