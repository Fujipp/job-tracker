export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'First Move — Job Tracker',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/brand-mark.svg' }],
      meta: [
        { name: 'description', content: 'Your private, local-first job application command center.' },
        { name: 'theme-color', content: '#ffffff' }
      ]
    }
  },
  // Avoid Nuxt's dev-only #app-manifest alias issue. This app does not use
  // client-side route rules, so disabling the experimental manifest is safe.
  experimental: { appManifest: false },
  typescript: { strict: true },
  runtimeConfig: { dataDir: process.env.JOB_TRACKER_DATA_DIR || './data' }
})
