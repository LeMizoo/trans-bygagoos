import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        card: 'rgb(var(--card))',
        'card-foreground': 'rgb(var(--card-foreground))',
        primary: {
          DEFAULT: '#e94560',
          50: '#fef2f4',
          100: '#fde6e9',
          200: '#fbd0d8',
          300: '#f7aab8',
          400: '#f27a93',
          500: '#e94560',
          600: '#d42a4e',
          700: '#b21d40',
          800: '#951b3b',
          900: '#801a38',
        },
        muted: 'rgb(var(--muted))',
        'muted-foreground': 'rgb(var(--muted-foreground))',
        border: 'rgb(var(--border))',
        ring: 'rgb(var(--ring))',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config
