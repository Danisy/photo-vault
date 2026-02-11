/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'film-cream': '#F5F5F0',
                'film-paper': '#EAEAE5',
                'film-black': '#1A1A1A',
                'film-gray': '#8A8A8A',
                'film-red': '#8A2525', // Darkroom accent
                'film-red-dark': '#4a0505', // Deep red for Darkroom mode
                'film-black-pure': '#000000', // True black for Darkroom mode
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
                mono: ['"Courier Prime"', 'monospace'],
            },
            backgroundImage: {
                'grain': "url('/noise.png')", // We will add a CSS noise generator instead of image file to keep it simple
            }
        },
    },
    plugins: [],
}
