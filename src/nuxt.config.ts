// Langs
import ENFiles from './i18n/locales/EN/en.json'
import RUFiles from './i18n/locales/RU/ru.json'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  srcDir: 'app/',
  ssr: false, // SPA

  nitro: {
    prerender: {
      concurrency: 4,
      interval: 500,
    },
    compressPublicAssets: { gzip: true, brotli: true },
    routeRules: {
      '/_nuxt/**': {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      },
      '/public/**': {
        headers: { 'Cache-Control': 'public, max-age=2592000, immutable' }, // 30 дней
      },
      '/image/**': {
        headers: { 'Cache-Control': 'public, max-age=604800, immutable' }, // 7 дней
      },
    },
  },

  vite: {
    optimizeDeps: {
      exclude: ['estree-walker', 'entities'],
    },
    define: {
      'process.env.DEBUG': false,
    },
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/scss/colors-variables.scss" as *;
            @use "~/assets/scss/base/basic-mixins.scss" as *;
            @use "~/assets/scss/fonts/typography.scss" as *;
            @use "~/assets/scss/base/breakpoints.scss" as *;
            @use "~/assets/scss/themes/dark.scss" as *;
            @use "~/assets/scss/themes/light.scss" as *;
          `,
        },
      },
    },
  },

  app: {
    head: {
      viewport:
        'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no interactive-widget=resizes-visual',
      htmlAttrs: { dir: 'ltr', lang: 'ru' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon/favicon-16x16.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '96x96',
          href: '/favicon/favicon-96x96.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/favicon/apple-icon-180x180.png',
        },
      ],
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
    },
    baseURL: '/todo-luna/',
  },

  build: {
    transpile: ['vue', 'estree-walker', 'entities'],
  },

  plugins: ["@/plugins/click-outside-vue3.ts"],

  css: [
    '~/assets/scss/main.scss',
    'flag-icons/css/flag-icons.min.css'
  ],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-viewport',
    'nuxt-svgo',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    'dayjs-nuxt',
    '@vite-pwa/nuxt'
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      display: 'standalone',
      name: 'Todo Luna',
      short_name: 'Todo Luna',
      description: 'Чистое пространство для ваших мыслей и задач',
      theme_color: '#181b1f',
      background_color: '#181b1f',
      icons: [
        {
          type: 'image/png',
          sizes: '16x16',
          src: '/favicon/favicon-16x16.png',
        },
        {
          type: 'image/png',
          sizes: '32x32',
          src: '/favicon/favicon-32x32.png',
        },
        {
          type: 'image/png',
          sizes: '96x96',
          src: '/favicon/favicon-96x96.png',
        },
        {
          sizes: '192x192',
          type: 'image/png',
          src: '/favicon/android-icon-192x192.png',
        },
        {
          src: '/favicon/ms-icon-310x310.png',
          sizes: '310x310',
          type: 'image/png',
        },
        {
          src: '/favicon/ms-icon-310x310.png',
          sizes: '310x310',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      scope: '/todo-luna/',
      start_url: '/todo-luna/'
    },
    workbox: {
      navigateFallback: '/todo-luna/', 
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'], // кеширование ресурсов
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  viewport: {
    breakpoints: {
      zero: 0,
      mobile: 959,
      tablet: 1239,
      desktop: 1439,
      desktopWide: 2500,
    },
  },

  svgo: {
    autoImportPath: '~/assets/icons',
    global: true,
  },

  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpg', 'jpeg', 'png', 'gif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  },

  i18n: {
    locales: [
      {
        code: 'EN',
        name: 'English',
        files: ENFiles.files,
      },
      {
        code: 'RU',
        name: 'Russian',
        files: RUFiles.files,
      },
    ],
    defaultLocale: 'RU',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
      fallbackLocale: 'RU',
      redirectOn: 'root',
    },
    langDir: 'locales/',
    strategy: 'no_prefix',
  },

  dayjs: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    plugins: [
      'relativeTime',
      'utc',
      'timezone',
      'localizedFormat',
      'advancedFormat'
    ],
  },

  features: {
    inlineStyles: false
  },
})