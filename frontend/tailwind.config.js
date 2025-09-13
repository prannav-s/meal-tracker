import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ]
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        sleek: {
          primary: '#6366F1',
          'primary-content': '#ffffff',
          secondary: '#06B6D4',
          'secondary-content': '#05202B',
          accent: '#22C55E',
          'accent-content': '#05240F',
          neutral: '#334155',
          'neutral-content': '#E2E8F0',
          'base-100': '#F8FAFC',
          'base-200': '#F1F5F9',
          'base-300': '#E2E8F0',
          'base-content': '#0F172A',
          info: '#0EA5E9',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          'rounded-box': '0.75rem',
          'rounded-btn': '0.5rem',
          'rounded-badge': '0.5rem',
        },
      },
      {
        'sleek-dark': {
          primary: '#818CF8',
          'primary-content': '#0B1220',
          secondary: '#22D3EE',
          'secondary-content': '#05202B',
          accent: '#34D399',
          'accent-content': '#05240F',
          neutral: '#0F172A',
          'neutral-content': '#CBD5E1',
          'base-100': '#0B1220',
          'base-200': '#0F172A',
          'base-300': '#1E293B',
          'base-content': '#E2E8F0',
          info: '#0EA5E9',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#F87171',
          'rounded-box': '0.75rem',
          'rounded-btn': '0.5rem',
          'rounded-badge': '0.5rem',
        },
      },
      {
        warmth: {
          primary: '#7f1d1d',
          'primary-content': '#ffffff',
          secondary: '#fa8072',
          'secondary-content': '#1f1b16',
          accent: '#e07a5f',
          'accent-content': '#1f1b16',
          neutral: '#3f2e2e',
          'neutral-content': '#f7f2ea',
          'base-100': '#e6ddcc',
          'base-200': '#cfb89f',
          'base-300': '#bfa085',
          'base-content': '#1f1b16',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#dc2626',
          'rounded-box': '0.75rem',
          'rounded-btn': '0.5rem',
          'rounded-badge': '0.5rem',
        },
      },
    ]
  }
}
