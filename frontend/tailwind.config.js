import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
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
