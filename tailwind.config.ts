import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--bg-primary)',
        panel: 'var(--bg-secondary)',
        panelHover: 'var(--bg-tertiary)',
        gold: 'var(--accent-gold)',
        goldLight: 'var(--accent-gold-light)',
        teal: 'var(--accent-teal)',
        text: 'var(--text-primary)',
        muted: 'var(--text-secondary)',
        subtle: 'var(--text-muted)',
        border: 'var(--border)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(201, 168, 76, 0.08)',
        soft: '0 16px 32px rgba(0, 0, 0, 0.22)',
      },
      backgroundImage: {
        'aseel-grid':
          'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.12) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
