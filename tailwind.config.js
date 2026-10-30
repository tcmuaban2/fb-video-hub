/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fefdfa',
          100: '#fbf8f0',
          200: '#f5edd9',
          300: '#ecdcbe',
          400: '#dfc69d',
          500: '#cda875',
          600: '#b58b54',
          700: '#946e3e',
          800: '#785735',
          900: '#62462d',
        },
        warm: {
          bg: '#faf6ee',
          surface: '#fffefb',
          card: '#ffffff',
          border: '#e8e2d4',
          borderLight: '#f1ede3',
          text: '#292524',
          subtext: '#78716c',
          accent: '#b45309', // amber 700
          accentBg: '#fef3c7',
        }
      },
    },
  },
  plugins: [],
};
