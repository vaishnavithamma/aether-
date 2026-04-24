import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface1: 'var(--surface1)',
        surface2: 'var(--surface2)',
        surface3: 'var(--surface3)',
        border: 'var(--border)',
        'border-act': 'var(--border-act)',
        cyan: 'var(--cyan)',
        'cyan-dim': 'var(--cyan-dim)',
        amber: 'var(--amber)',
        orange: 'var(--orange)',
        red: 'var(--red)',
        success: 'var(--success)'
      },
      fontFamily: {
        ui: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
} satisfies Config
