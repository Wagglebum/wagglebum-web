import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#141414', soft: '#222222' },
        charcoal: '#3a3a3a',
        graphite: '#5c5c5c',
        stone: '#8a8a8a',
        mist: '#bdbdbd',
        cloud: '#d9d9d9',
        pearl: '#e8e8e8',
        bone: '#f2efe9',
        paper: '#faf7f2',
        snow: '#ffffff',
        blush: { 50: '#faeeea', 100: '#f3d8d1', 300: '#d9a89c', 500: '#b07a6d', 700: '#7a4f46' },
        ok: '#4a7a5a', warn: '#a87b3a', danger: '#a8463a', info: '#3a6aa8',
        fg: { DEFAULT: '#141414', muted: '#5c5c5c', subtle: '#8a8a8a' },
        border: { DEFAULT: '#e8e8e8', strong: '#d9d9d9' },
      },
      fontFamily: {
        sans: ['Rubik', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Rubik', 'ui-rounded', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs': '6px', 'sm': '10px', 'md': '14px', 'lg': '20px', 'xl': '28px', '2xl': '36px',
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(20,20,20,0.06)',
        'sm':  '0 2px 6px rgba(20,20,20,0.08), 0 1px 2px rgba(20,20,20,0.04)',
        'md':  '0 6px 18px rgba(20,20,20,0.10), 0 2px 4px rgba(20,20,20,0.05)',
        'lg':  '0 14px 36px rgba(20,20,20,0.14), 0 4px 10px rgba(20,20,20,0.06)',
        'xl':  '0 28px 64px rgba(20,20,20,0.18), 0 8px 18px rgba(20,20,20,0.08)',
        'pop': '0 4px 0 #141414',
        'pop-sm': '0 3px 0 #141414',
      },
      transitionTimingFunction: {
        'out-wag': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-wag': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        waggle: { '0%, 100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-6deg)' }, '75%': { transform: 'rotate(6deg)' } },
      },
      animation: { waggle: 'waggle 600ms ease-in-out' },
      typography: {
        wag: {
          css: {
            '--tw-prose-body':        '#3a3a3a',
            '--tw-prose-headings':    '#141414',
            '--tw-prose-lead':        '#5c5c5c',
            '--tw-prose-links':       '#7a4f46',
            '--tw-prose-bold':        '#141414',
            '--tw-prose-counters':    '#8a8a8a',
            '--tw-prose-bullets':     '#bdbdbd',
            '--tw-prose-hr':          '#e8e8e8',
            '--tw-prose-quotes':      '#3a3a3a',
            '--tw-prose-quote-borders': '#d9d9d9',
            '--tw-prose-captions':    '#8a8a8a',
            '--tw-prose-code':        '#141414',
            '--tw-prose-pre-code':    '#f2efe9',
            '--tw-prose-pre-bg':      '#222222',
            '--tw-prose-th-borders':  '#e8e8e8',
            '--tw-prose-td-borders':  '#e8e8e8',
          },
        },
      },
    },
  },
  plugins: [
    typography,
  ],
};
export default config;
