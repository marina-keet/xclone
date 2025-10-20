/** @type {import('tailwindcss').Config} */
export default {
  content: ['./resources/views/**/*.edge', './resources/js/**/*.js', './resources/css/**/*.css'],
  theme: {
    extend: {
      colors: {
        'x-blue': '#1d9bf0',
        'x-dark': '#000000',
        'x-gray': '#536471',
        'x-light-gray': '#f7f9fa',
      },
      fontFamily: {
        chirp: ['TwitterChirp', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
