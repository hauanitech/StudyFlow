/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Galactic Dark Theme
        galaxy: {
          50: '#e8ebf4',
          100: '#c5cce3',
          200: '#9faad0',
          300: '#7888bd',
          400: '#5b6faf',
          500: '#3e56a1',
          600: '#003c91',  // Primary blue
          700: '#002063',  // Deep blue
          800: '#041642',  // Navy
          900: '#19192c',  // Background dark
          950: '#0d0d18',  // Deepest dark
        },
        primary: {
          50: '#e8f0ff',
          100: '#d4e3ff',
          200: '#afc9ff',
          300: '#7aa5ff',
          400: '#4d7fff',
          500: '#2563eb',
          600: '#003c91',
          700: '#002063',
          800: '#041642',
          900: '#19192c',
          950: '#0d0d18',
        },
        accent: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5ff',
          300: '#a3b8ff',
          400: '#7b91ff',
          500: '#5b6faf',
          600: '#4a5899',
          700: '#3a4578',
          800: '#2d3557',
          900: '#1f2438',
        },
        surface: {
          50: '#f8f9fc',
          100: '#f1f3f9',
          200: '#e2e6f0',
          300: '#c8cee0',
          400: '#9aa4c0',
          500: '#6b779f',
          600: '#4d5775',
          700: '#363d52',
          800: '#252a3a',
          900: '#1a1d28',
          950: '#12141c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'galaxy-gradient': 'linear-gradient(135deg, #19192c 0%, #041642 50%, #002063 100%)',
        'galaxy-radial': 'radial-gradient(ellipse at top, #002063 0%, #041642 40%, #19192c 100%)',
        'galaxy-glow': 'radial-gradient(ellipse at center, rgba(0, 60, 145, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 60, 145, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 60, 145, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(0, 60, 145, 0.2)',
      },
    },
  },
  plugins: [],
};
