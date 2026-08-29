import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: ['./components/**/*.{vue,js,ts}', './layouts/**/*.vue', './pages/**/*.vue', './app.vue'],
  theme: {
    extend: {
      colors: {
        ink: '#17211b',
        canvas: '#f5f4ef',
        panel: '#fffefa',
        moss: '#285943',
        lime: '#c7f464',
        rust: '#c8623c',
        muted: '#68736b'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'], display: ['Georgia', 'serif'] },
      boxShadow: { soft: '0 14px 40px rgba(23,33,27,.08)', card: '0 5px 16px rgba(23,33,27,.06)' }
    }
  }
}
