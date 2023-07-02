/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './stories/**/*.{js,ts,jsx,tsx}', './storybook/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
