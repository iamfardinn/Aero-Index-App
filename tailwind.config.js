/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        spike:    '#6E1A37',
        'spike-light': '#6E1A3710',
        'spike-border': '#6E1A3730',
        sky: {
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
        slate: {
          100: '#f1f5f9',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
        emerald: {
          50:  '#ecfdf5',
          200: '#a7f3d0',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      fontFamily: {
        grotesk: ['SpaceGrotesk_700Bold'],
      },
    },
  },
  plugins: [],
};
