/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0A',
          surface: '#111111',
          surfaceHover: '#171717',
          border: '#222222',
          borderSubtle: '#1C1C1C',
        },
        neutral: {
          950: '#0A0A0A',
          900: '#111111',
          850: '#141414',
          800: '#222222',
          700: '#333333',
          400: '#A1A1AA',
          100: '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
};
