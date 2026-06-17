/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        space: {
          base: '#0a0e1a',
          deep: '#0d1424',
          navy: '#111827',
          card: '#1a2236',
          surface: '#1e2a3a',
          border: '#2d3a4f',
        },
        brand: {
          blue: '#3b82f6',
          'blue-light': '#60a5fa',
          violet: '#7c3aed',
          'violet-light': '#a78bfa',
        }
      },
      animation: {
        'flame': 'flame 1.5s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'orbit': 'orbit 8s linear infinite',
        'particle': 'particle 0.8s ease-out forwards',
        'pulse-green': 'pulseGreen 0.5s ease-out',
        'shake-red': 'shakeRed 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        flame: {
          '0%': { transform: 'scaleY(1) rotate(-3deg)', filter: 'brightness(1)' },
          '100%': { transform: 'scaleY(1.15) rotate(3deg)', filter: 'brightness(1.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(14px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(14px) rotate(-360deg)' },
        },
        particle: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: 1 },
          '100%': { transform: 'scale(0) translateY(-40px)', opacity: 0 },
        },
        pulseGreen: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(16,185,129,0.25)' },
          '100%': { backgroundColor: 'transparent' },
        },
        shakeRed: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        twinkle: {
          '0%': { opacity: 0.3, transform: 'scale(0.8)' },
          '100%': { opacity: 1, transform: 'scale(1.2)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
