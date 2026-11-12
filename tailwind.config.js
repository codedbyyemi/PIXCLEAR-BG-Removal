/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pix: {
          purple: '#6841e8',
          dark: '#211f2b',
          muted: '#82808d',
          mint: '#57c7ad',
        },
      },
      fontFamily: {
        sans: ['Nunito Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
