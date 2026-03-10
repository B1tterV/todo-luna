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
          href: '/favicon/favicon.svg',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon/favicon-32x32.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/favicon/apple-touch-icon.png',
        },
      ],
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
    },
    baseURL: '/',
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
    'dayjs-nuxt'
  ],

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