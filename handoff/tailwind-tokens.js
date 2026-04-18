// Drop into tailwind.config.ts under `theme.extend`.
// These extend, not replace, Tailwind's defaults — so you keep the normal
// `bg-white`, `text-black`, `rounded-lg`, etc. utilities.

module.exports = {
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#141414',
          soft: '#222222',
        },
        charcoal: '#3a3a3a',
        graphite: '#5c5c5c',
        stone: '#8a8a8a',
        mist: '#bdbdbd',
        cloud: '#d9d9d9',
        pearl: '#e8e8e8',
        bone: '#f2efe9',
        paper: '#faf7f2',
        snow: '#ffffff',
        blush: {
          50:  '#faeeea',
          100: '#f3d8d1',
          300: '#d9a89c',
          500: '#b07a6d',
          700: '#7a4f46',
        },
        // semantic status (muted, earthy)
        ok:     '#4a7a5a',
        warn:   '#a87b3a',
        danger: '#a8463a',
        info:   '#3a6aa8',
      },
      fontFamily: {
        sans: ['Rubik', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Rubik', 'ui-rounded', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs': '6px',
        'sm': '10px',
        'md': '14px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '36px',
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(20,20,20,0.06)',
        'sm':  '0 2px 6px rgba(20,20,20,0.08), 0 1px 2px rgba(20,20,20,0.04)',
        'md':  '0 6px 18px rgba(20,20,20,0.10), 0 2px 4px rgba(20,20,20,0.05)',
        'lg':  '0 14px 36px rgba(20,20,20,0.14), 0 4px 10px rgba(20,20,20,0.06)',
        'xl':  '0 28px 64px rgba(20,20,20,0.18), 0 8px 18px rgba(20,20,20,0.08)',
        // the signature chunky pop shadow — solid 4px ink offset, no blur
        'pop': '0 4px 0 #141414',
        'pop-sm': '0 3px 0 #141414',
      },
      transitionTimingFunction: {
        'out-wag': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-wag': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        waggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-6deg)' },
          '75%': { transform: 'rotate(6deg)' },
        },
      },
      animation: {
        waggle: 'waggle 600ms ease-in-out',
      },
    },
  },
};
