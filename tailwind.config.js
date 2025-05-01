/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './Pages/**/*.cshtml',
        './Views/**/*.cshtml'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                display: ['Poppins', 'ui-sans-serif', 'system-ui'],
            },
            boxShadow: {
                'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
                'medium': '0 4px 20px rgba(0, 0, 0, 0.07)',
                'hard': '0 6px 30px rgba(0, 0, 0, 0.1)'
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            aspectRatio: {
                '1': '1',
                '16/9': '16 / 9',
                '4/3': '4 / 3',
                '3/2': '3 / 2',
                '2/3': '2 / 3',
                '9/16': '9 / 16',
            },
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            'primary': {
                DEFAULT: '#3B82F6', // Bright blue
                50: '#EFF6FF',
                100: '#DBEAFE',
                200: '#BFDBFE',
                300: '#93C5FD',
                400: '#60A5FA',
                500: '#3B82F6', // Default
                600: '#2563EB',
                700: '#1D4ED8',
                800: '#1E40AF',
                900: '#1E3A8A',
                950: '#172554',
            },
            'secondary': {
                DEFAULT: '#6B7280', // Cool gray
                50: '#F9FAFB',
                100: '#F3F4F6',
                200: '#E5E7EB',
                300: '#D1D5DB',
                400: '#9CA3AF',
                500: '#6B7280', // Default
                600: '#4B5563',
                700: '#374151',
                800: '#1F2937',
                900: '#111827',
                950: '#030712',
            },
            'black': '#111827',
            'white': '#ffffff',
            'surface': {
                DEFAULT: '#F9FAFB',
                100: '#F3F4F6',
                200: '#E5E7EB',
            },
            'success': {
                DEFAULT: '#10B981', // Green
                50: '#ECFDF5',
                100: '#D1FAE5',
                200: '#A7F3D0',
                300: '#6EE7B7',
                400: '#34D399',
                500: '#10B981', // Default
                600: '#059669',
                700: '#047857',
                800: '#065F46',
                900: '#064E3B',
                950: '#022C22',
            },
            'warning': {
                DEFAULT: '#F59E0B', // Amber
                50: '#FFFBEB',
                100: '#FEF3C7',
                200: '#FDE68A',
                300: '#FCD34D',
                400: '#FBBF24',
                500: '#F59E0B', // Default
                600: '#D97706',
                700: '#B45309',
                800: '#92400E',
                900: '#78350F',
                950: '#451A03',
            },
            'danger': {
                DEFAULT: '#EF4444', // Red
                50: '#FEF2F2',
                100: '#FEE2E2',
                200: '#FECACA',
                300: '#FCA5A5',
                400: '#F87171',
                500: '#EF4444', // Default
                600: '#DC2626',
                700: '#B91C1C',
                800: '#991B1B',
                900: '#7F1D1D',
                950: '#450A0A',
            },
            'accent': {
                DEFAULT: '#8B5CF6', // Purple
                50: '#F5F3FF',
                100: '#EDE9FE',
                200: '#DDD6FE',
                300: '#C4B5FD',
                400: '#A78BFA',
                500: '#8B5CF6', // Default
                600: '#7C3AED',
                700: '#6D28D9',
                800: '#5B21B6',
                900: '#4C1D95',
                950: '#2E1065',
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
    ],
}