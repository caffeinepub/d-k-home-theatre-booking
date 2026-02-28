import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                display: ['Playfair Display', 'Georgia', 'serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
                candy: ['Fredoka One', 'Arial Black', 'sans-serif'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                theatre: {
                    gold: 'oklch(var(--theatre-gold))',
                    'gold-dim': 'oklch(var(--theatre-gold-dim))',
                    red: 'oklch(var(--theatre-red))',
                    dark: 'oklch(var(--theatre-dark))',
                    surface: 'oklch(var(--theatre-surface))',
                    grey: 'oklch(var(--theatre-grey))',
                },
                // Vibrant cinematic palette tokens
                'deep-purple': {
                    DEFAULT: 'oklch(0.55 0.30 290)',
                    light: 'oklch(0.65 0.28 290)',
                    dark: 'oklch(0.42 0.28 290)',
                },
                'electric-teal': {
                    DEFAULT: 'oklch(0.65 0.22 200)',
                    light: 'oklch(0.75 0.20 200)',
                    dark: 'oklch(0.50 0.22 200)',
                },
                'vivid-crimson': {
                    DEFAULT: 'oklch(0.58 0.26 25)',
                    light: 'oklch(0.68 0.24 25)',
                    dark: 'oklch(0.45 0.26 25)',
                },
                'warm-amber': {
                    DEFAULT: 'oklch(0.78 0.20 75)',
                    light: 'oklch(0.88 0.18 75)',
                    dark: 'oklch(0.62 0.20 75)',
                },
                'midnight-blue': {
                    DEFAULT: 'oklch(0.55 0.28 250)',
                    light: 'oklch(0.65 0.25 250)',
                    dark: 'oklch(0.40 0.28 250)',
                },
                'hot-pink': {
                    DEFAULT: 'oklch(0.72 0.28 350)',
                    light: 'oklch(0.82 0.25 350)',
                    dark: 'oklch(0.58 0.28 350)',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                gold: '0 0 20px oklch(0.78 0.12 85 / 0.25)',
                'gold-lg': '0 0 40px oklch(0.78 0.12 85 / 0.3)',
                'neon-cyan': '0 0 20px oklch(0.65 0.22 200 / 0.5)',
                'neon-pink': '0 0 20px oklch(0.72 0.28 350 / 0.5)',
                'neon-purple': '0 0 20px oklch(0.55 0.30 290 / 0.5)',
                'neon-amber': '0 0 20px oklch(0.78 0.20 75 / 0.5)',
                'neon-crimson': '0 0 20px oklch(0.58 0.26 25 / 0.5)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'float-up': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'banner-pulse': {
                    '0%, 100%': { opacity: '0.8' },
                    '50%': { opacity: '1' },
                },
                'color-shift': {
                    '0%, 100%': { filter: 'hue-rotate(0deg)' },
                    '33%': { filter: 'hue-rotate(60deg)' },
                    '66%': { filter: 'hue-rotate(120deg)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                shimmer: 'shimmer 2s linear infinite',
                'float-up': 'float-up 3s ease-in-out infinite',
                'banner-pulse': 'banner-pulse 4s ease-in-out infinite',
                'color-shift': 'color-shift 8s ease-in-out infinite',
            }
        }
    },
    plugins: [typography, containerQueries, animate],
};
