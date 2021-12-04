
// import webpack from 'webpack'

export default {
  debug: true,
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',

  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: []
  },

  /*
  ** Global CSS
  */
  css: ['~/node_modules/video.js/dist/video-js.css'],
  // '~/node_modules/bootstrap/dist/css/bootstrap.css',
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [],

  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,

  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://http.nuxtjs.org
    '@nuxt/http',
    'nuxt-basic-auth-module',
    'bootstrap-vue/nuxt'
  ],

  /*
  ** Server Middleware
  */
  serverMiddleware: {
    '/api': '~/api'
  },

  /*
  ** For deployment you might want to edit host and port
  */
  server: {
    port: 8000, // default: 3000
    host: '0.0.0.0' // default: localhost
  },
  basic: {
    name: 'admin',
    pass: 'password',
    enabled: 'true', // require boolean value(nullable)
    match: ['/'],
    message: ''
  },

  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    vendor: ['video.js']
  }
}
