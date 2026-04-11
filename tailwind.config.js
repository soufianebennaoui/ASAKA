/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Asaka Sushi Premium Palette (Front Office) ───────────
        obsidian: {
          950: '#050505',
          900: '#0A0A0A',
          800: '#141414',
          700: '#1C1C1C',
        },
        salmon: {
          400: '#FF9E80',
          500: '#FF8C69',
          600: '#E67E5E',
        },
        'sea-blue': {
          400: '#81D4FA',
          500: '#4FC3F7',
          600: '#29B6F6',
        },
        champagne: {
          DEFAULT: '#F5F5DC',
          muted: '#D0C9B5',
        },
        // ── Asaka Back Office Palette (Admin) ─────────────────────
        asaka: {
          950:  '#030810',
          900:  '#060d18',
          850:  '#0a1628',
          800:  '#0d1b2a',
          750:  '#102035',
          700:  '#1a2d4a',
          600:  '#1e3a5f',
          500:  '#1565c0',
          400:  '#1976d2',
          300:  '#4fc3f7',
          200:  '#81d4fa',
          100:  '#b3e5fc',
          50:   '#e1f5fe',
          muted:'#94a3b8',
        },
        wa: '#25d366',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        brush: ['Ma Shan Zheng', 'cursive'],
        serif: ['Lora', 'serif'],
      },
      animation: {
        'float':        'float 6s ease-in-out infinite alternate',
        'float-slow':   'float 9s ease-in-out infinite alternate',
        'float-fast':   'float 4s ease-in-out infinite alternate',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'fade-up':      'fadeUp 0.6s ease forwards',
        'fade-in':      'fadeIn 0.4s ease forwards',
        'scale-in':     'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-up':     'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'spin-slow':    'spin 25s linear infinite',
        'spin-reverse': 'spinReverse 18s linear infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
        'particle':     'particle1 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%':   { transform: 'translateY(0px) rotate(-3deg)' },
          '100%': { transform: 'translateY(-24px) rotate(3deg)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%':     { opacity: '1',   transform: 'scale(1.05)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)' },
        },
        bounceSoft: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        particle1: {
          '0%,100%': { transform: 'translate(0,0) rotate(0deg)', opacity: '0.6' },
          '33%':     { transform: 'translate(30px,-40px) rotate(120deg)', opacity: '1' },
          '66%':     { transform: 'translate(-20px,-20px) rotate(240deg)', opacity: '0.4' },
        },
      },
      boxShadow: {
        'glow-salmon': '0 0 20px rgba(255,140,105,0.4), 0 0 60px rgba(255,140,105,0.15)',
        'glow-sea':    '0 0 20px rgba(79,195,247,0.4),  0 0 60px rgba(79,195,247,0.15)',
        'glow-blue':   '0 0 20px rgba(21,101,192,0.4),  0 0 60px rgba(21,101,192,0.15)',
        'glow-ice':    '0 0 20px rgba(79,195,247,0.4),  0 0 60px rgba(79,195,247,0.15)',
      },
    },
  },
  plugins: [],
}
