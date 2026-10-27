/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3B82F6', // Blue Brand Default
          hover: '#1D4ED8',   // Blue Brand Hover
        },
        secondary: {
          DEFAULT: '#BFDBFE', // Light Blue Secondary
          hover: '#93C5FD',   // Light Blue Secondary Hover
        },
        tertiary: {
          DEFAULT: '#F3F4F6', // Soft Grey Tertiary
          hover: '#E5E7EB',   // Soft Grey Tertiary Hover
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};