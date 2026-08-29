export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'First Move — Job Tracker',
      meta: [
        { name: 'description', content: 'Your private, local-first job application command center.' },
        { name: 'theme-color', content: '#f5f4ef' }
      ]
    }
  },
  typescript: { strict: true },
  runtimeConfig: { dataDir: process.env.JOB_TRACKER_DATA_DIR || './data' }
})
