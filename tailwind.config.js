/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: ["./*.{html,js}"],
  theme: {
    // Override default font sizes (rem → px)
    fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '48px' }],
        '6xl': ['60px', { lineHeight: '60px' }],
        '7xl': ['72px', { lineHeight: '72px' }],
        '8xl': ['96px', { lineHeight: '96px' }],
        '9xl': ['128px', { lineHeight: '128px' }],
        '2xs': ['10px', { lineHeight: '14px' }], // Custom
    },

    // Override default spacing scale (rem → px)
    spacing: {
        'px': '1px',
        '0': '0px',
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '18': '72px',      // Custom
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '88': '352px',     // Custom
        '96': '384px',
        '100': '400px',    // Custom
        '120': '480px',    // Custom
        '150': '600px',    // Custom
        '180': '720px',    // Custom
    },

    // Override border radius (rem → px)
    borderRadius: {
        'none': '0px',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
        'card': '12px',    // Custom
        'button': '8px',   // Custom
    },

    extend: {
        colors: {
            // === Brand Colors ===
            brand: {
                primary: '#79be15',      // Main green (Mendelu)
                'primary-hover': '#6aab12',
                accent: '#8DC843',       // Lighter green accent
                'accent-hover': '#7db83a',
                dark: '#444444',
            },

            // === Legacy Mendelu Colors (backwards compat) ===
            mendelu: {
                green: '#79be15',
                light: '#A0D25A',
                dark: '#444444',
            },
            
            // Explicit override for text-primary to ensure it hits
            primary: '#79be15',
        },
        fontFamily: {
            inter: ['Inter', 'sans-serif'],
        },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
        {
            mendelu: {
                "primary": "#79be15",
                "primary-content": "#ffffff",
                "secondary": "#8DC843",
                "secondary-content": "#ffffff",
                "accent": "#00548f",
                "accent-content": "#ffffff",
                "neutral": "#444444",
                "neutral-content": "#ffffff",
                "base-100": "#ffffff",
                "base-200": "#f9fafb",
                "base-300": "#f3f4f6",
                "base-content": "#111827",
                "info": "#3b82f6",
                "success": "#22c55e",
                "warning": "#f59e0b",
                "error": "#ef4444",
            },
        },
        {
            "mendelu-dark": {
                "primary": "#79be15",
                "primary-content": "#ffffff",
                "secondary": "#8DC843",
                "secondary-content": "#ffffff",
                "accent": "#3b82f6",
                "accent-content": "#ffffff",
                "neutral": "#1f2937",
                "neutral-content": "#d1d5db",
                "base-100": "#1f2937",
                "base-200": "#111827",
                "base-300": "#0f172a",
                "base-content": "#f3f4f6",
                "info": "#3b82f6",
                "success": "#22c55e",
                "warning": "#f59e0b",
                "error": "#ef4444",
            },
        },
    ],
    base: true,      // Include base component styles
    styled: true,    // Include component styles
    utils: true,     // Include utility classes
    logs: false,     // Disable console logs
  },
  safelist: [
    // DaisyUI components
    'btn', 'btn-primary', 'btn-secondary', 'btn-ghost', 'btn-sm', 'btn-lg', 'btn-circle', 'btn-outline',
    'card', 'card-body', 'card-title', 'card-actions',
    'input', 'input-bordered',
    'alert', 'alert-success', 'alert-error', 'alert-warning', 'alert-info',
    'modal', 'modal-box', 'modal-backdrop',
    'badge', 'badge-primary',
    'skeleton',
    'navbar', 'menu',
    'form-control', 'label', 'label-text',
    'loading', 'loading-spinner', 'loading-xs', 'loading-sm', 'loading-md', 'loading-lg',
    'toast',
  ],
}
