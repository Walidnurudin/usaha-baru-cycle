import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0f7f8',
          100: '#ddedf0',
          200: '#c0dfe4',
          300: '#94cbd5',
          400: '#4a9fb0',
          500: '#147688',
          600: '#064E5A', // Utama / Teal gelap
          700: '#05424d',
          800: '#04343d',
          900: '#03262d',
          950: '#011519',
        },
        copper: {
          50: '#fdf6ed',
          100: '#f9ead4',
          200: '#f4d3a9',
          300: '#ecb778',
          400: '#e19543',
          500: '#d77c1d',
          600: '#C66A0A', // Aksen / Oranye tembaga
          700: '#a55407',
          800: '#854209',
          900: '#6d370b',
          950: '#3c1b03',
        },
        surface: '#F3F6F6', // Pendukung / Abu-abu kebiruan
        charcoal: {
          DEFAULT: '#243238', // Warna teks utama
          muted: '#54666f',
          light: '#768790',
          dark: '#1a2428',
        },
        brand: {
          teal: '#064E5A',
          copper: '#C66A0A',
          surface: '#F3F6F6',
          charcoal: '#243238',
          50: '#f0f7f8',
          100: '#ddedf0',
          200: '#c0dfe4',
          300: '#94cbd5',
          400: '#4a9fb0',
          500: '#147688',
          600: '#064E5A',
          700: '#05424d',
          800: '#04343d',
          900: '#03262d',
          950: '#011519',
        },
      },
    },
  },
  plugins: [],
};

export default config;
