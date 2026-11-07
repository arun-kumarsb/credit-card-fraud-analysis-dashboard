/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF8FF',
        surface: {
          DEFAULT: '#FFFFFF',
          dim: '#D2D9F4',
          container: '#EAEDFF',
          high: '#E2E7FF',
          low: '#F2F3FF'
        },
        primary: {
          DEFAULT: '#2563EB',
          dark: '#004AC6',
          light: '#DBE1FF'
        },
        secondary: {
          DEFAULT: '#00668A',
          sky: '#38BDF8',
          light: '#C4E7FF'
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#006242',
          light: '#ECFDF5'
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#BA1A1A',
          light: '#FEF2F2'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7'
        },
        slate: {
          hairline: '#E2E8F0',
          muted: '#64748B',
          body: '#334155',
          heading: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'ambient': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        'elevated': '0 10px 25px -3px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)'
      }
    },
  },
  plugins: [],
}
