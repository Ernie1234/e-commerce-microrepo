/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    './src/**/*.{ts,tsx,js,jsx}}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      fontFamily: {
        Roboto: ['var(--font-roboto)'],
        Poppins: ['var(--font-poppins)'],
        Montserrat: ['var(--font-montserrat)'],
        Inter: ['var(--font-inter)'],
        Lato: ['var(--font-lato)'],
        Raleway: ['var(--font-raleway)'],
        Anta: ['var(--font-anta)'],
      },
    },
  },
  plugins: [],
};
