/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Couleurs principales - Univers clair
        'texture': '#d4d4cc',           // Fond texture beige/gris clair
        'texture-light': '#e8e8e0',     // Plus clair
        'texture-dark': '#c8c8c0',      // Plus foncé
        
        // Textes
        'dark': '#1e1e1e',              // Texte noir sombre
        'text-dark': '#2d2d2d',         // Texte très sombre
        'text-muted': '#646460',        // Texte gris moyen
        'text-light': '#999994',        // Texte gris clair
        
        // Accents
        'accent': '#c4a77d',            // Or principal
        'accent-light': '#d4b89d',      // Or plus clair
        'accent-dark': '#a68a66',       // Or plus foncé
        
        // Éléments
        'card': '#f5f5f0',              // Cartes légères
        'border': '#d4d4cc',            // Bordures
        'bg-overlay': 'rgba(30, 30, 30, 0.05)',  // Overlay subtil
      },
      backgroundColor: {
        'texture': '#d4d4cc',
        'texture-light': '#e8e8e0',
        'texture-dark': '#c8c8c0',
      },
      textColor: {
        'dark': '#1e1e1e',
        'text-dark': '#2d2d2d',
        'text-muted': '#646460',
        'text-light': '#999994',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        'display-bold': ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Typographies pour titres
        'display-xl': ['3.5rem', { lineHeight: '1.1', fontWeight: '900' }],
        'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: '800' }],
        'display-md': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(15px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};