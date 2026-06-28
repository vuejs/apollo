import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/composable/typedoc-sidebar.json'

// Shared sidebar for guide sections
const guideSidebar = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Introduction', link: '/guide/' },
      { text: 'Why Apollo Client?', link: '/guide/why-apollo' },
      { text: 'Installation', link: '/guide/installation' },
    ],
  },
  {
    text: 'Core Concepts',
    items: [
      { text: 'Queries', link: '/data/queries' },
      { text: 'Mutations', link: '/data/mutations' },
      { text: 'Subscriptions', link: '/data/subscriptions' },
      { text: 'Refetching', link: '/data/refetching' },
      { text: 'Fragments', link: '/data/fragments' },
      { text: 'Data Masking', link: '/data/data-masking' },
      { text: 'Suspense', link: '/data/suspense' },
      { text: 'Error Handling', link: '/data/error-handling' },
      { text: 'TypeScript', link: '/data/typescript' },
    ],
  },
  {
    text: 'Caching',
    items: [
      { text: 'Overview', link: '/caching/overview' },
      { text: 'Reading & Writing', link: '/caching/interaction' },
      { text: 'Cache Updates', link: '/caching/cache-updates' },
      { text: 'Optimistic UI', link: '/caching/optimistic-ui' },
    ],
  },
  {
    text: 'Pagination',
    items: [
      { text: 'Overview', link: '/pagination/overview' },
      { text: 'Offset-based', link: '/pagination/offset-based' },
      { text: 'Cursor-based', link: '/pagination/cursor-based' },
    ],
  },
  {
    text: 'Local State',
    items: [
      { text: 'Overview', link: '/local-state/overview' },
    ],
  },
  {
    text: 'Advanced',
    items: [
      { text: 'Lazy Queries', link: '/advanced/lazy-queries' },
      { text: 'Streaming & @defer', link: '/advanced/streaming' },
      { text: 'Loading States', link: '/advanced/loading-states' },
      { text: 'Multiple Clients', link: '/advanced/multiple-clients' },
      { text: 'Outside Components', link: '/advanced/outside-components' },
    ],
  },
  {
    text: 'Networking',
    items: [
      { text: 'Basic HTTP', link: '/networking/basic-http' },
      { text: 'Authentication', link: '/networking/authentication' },
    ],
  },
  {
    text: 'Server-Side Rendering',
    items: [
      { text: 'Overview', link: '/ssr/overview' },
      { text: 'Nuxt', link: '/ssr/nuxt' },
    ],
  },
  {
    text: 'Migrating from v4',
    items: [
      { text: 'What\'s changed in v5', link: '/migration/whats-changed' },
      { text: 'Migration guide', link: '/migration/guide' },
      { text: 'Compat layer', link: '/migration/compat' },
    ],
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vue Apollo',
  description: 'Apollo/GraphQL integration for VueJS',
  markdown: {
    codeTransformers: [
      transformerTwoslash() as any,
    ],
  },
  head: [['link', { rel: 'icon', href: '/favicon.png' }]],
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/apollo' }],
    footer: {
      message: `Released under the MIT License.`,
      copyright: `Copyright © 2015-present Guillaume Chau`,
    },
    editLink: {
      pattern:
        'https://github.com/vuejs/apollo/edit/v4/packages/docs/:path',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/composable/' },
      {
        text: 'Sponsor',
        link: 'https://github.com/sponsors/Akryum',
      },
    ],

    sidebar: {
      '/guide/': guideSidebar,
      '/data/': guideSidebar,
      '/caching/': guideSidebar,
      '/pagination/': guideSidebar,
      '/local-state/': guideSidebar,
      '/advanced/': guideSidebar,
      '/networking/': guideSidebar,
      '/ssr/': guideSidebar,
      '/migration/': guideSidebar,
      '/api/composable/': [
        {
          text: '@vue/apollo-composable',
          link: '/api/composable/',
          items: typedocSidebar,
        },
      ],
    },
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'Vue Apollo',
      description: '🚀 Integrate GraphQL in your Vue.js apps!',
    },
  },

  vite: {
    ssr: {
      noExternal: ['vue-github-button'],
    },
  },
})
