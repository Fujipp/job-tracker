import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: ['./components/**/*.{vue,js,ts}', './layouts/**/*.vue', './pages/**/*.vue', './app.vue'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        moss: 'rgb(var(--color-accent) / <alpha-value>)',
        lime: 'rgb(var(--color-highlight) / <alpha-value>)',
        rust: 'rgb(var(--color-signal) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        brand: {
          red: '#ff1744',
          yellow: '#ffea00',
          green: '#00e676',
          cyan: '#00e5ff',
          blue: '#2979ff',
          purple: '#d500f9'
        }
      },
      fontFamily: { sans: ['Inter', 'Kanit', 'ui-sans-serif', 'system-ui'], display: ['Inter', 'Kanit', 'ui-sans-serif', 'system-ui'] },
      boxShadow: { soft: '0 14px 40px rgba(0,0,0,.10)', card: '0 5px 16px rgba(0,0,0,.06)' }
    }
  }
}
