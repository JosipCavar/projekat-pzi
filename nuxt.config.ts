// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css',
    'vuetify/styles', // Vuetify styles
    '@mdi/font/css/materialdesignicons.min.css', // Material Design Icons
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2024-12-10',
  build: {
    transpile: ['vuetify'], // Ensure Vuetify is transpiled
  },
})