/** @type {import('tailwindcss').Config} */

const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

module.exports = {
  darkMode: ['class'],
  content: [
    // Existing content paths for Nx (adjust if these had 'src/' as well)
    // Check if any of these original paths need to be adjusted:
    // './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    // './src/**/*.{ts,tsx,js,jsx}}',
    // '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',

    // A safer set for Next.js App Router (no src folder):
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}', // Add this for utils
    './(pages|components|app)/**/*.{ts,tsx,js,jsx,html}', // Adjust if your Nx config needs it

    ...createGlobPatternsForDependencies(__dirname),

    // These specific Shadcn paths also rely on 'src/' being the root of the app
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If using pages router
    './components/**/*.{js,ts,jsx,tsx,mdx}', // If you have components directly under the app root
    './app/**/*.{js,ts,jsx,tsx,mdx}', // If your app router pages are here
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Catches all in src
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
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
      caretColor: (theme) => theme('colors'),
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
