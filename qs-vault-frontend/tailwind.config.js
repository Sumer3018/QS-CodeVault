/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'scifi-bg': '#050505',
        'scifi-panel': '#0a0a10',
        'scifi-border': '#1f1f2e',
        'neon-green': '#00ff9d',
        'neon-blue': '#00f3ff',
        'neon-red': '#ff0055',
        'neon-purple': '#bd00ff',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'], // Falls back to standard monospace if font load fails
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}