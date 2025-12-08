import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/typedoc-sidebar.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vue Apollo',
  description: 'Apollo/GraphQL integration for VueJS',
  markdown: {
    codeTransformers: [transformerTwoslash() as any],
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
        'https://github.com/vuejs/apollo/edit/v4/packages/docs/src/:path',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      {
        text: 'Sponsor',
        link: 'https://github.com/sponsors/Akryum',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Next Steps',
          items: [
            { text: 'Composition API', link: '/guide-composable/setup' },
          ],
        },
      ],
      '/guide-composable/': [
        {
          text: 'Composition API',
          items: [
            { text: 'Setup', link: '/guide-composable/setup' },
          ],
        },
      ],
      '/guide-option/': [
        {
          text: 'Option API',
          items: [
            { text: 'Setup', link: '/guide-option/setup' },
          ],
        },
      ],
      '/guide-components/': [
        {
          text: 'Components',
          items: [
            { text: 'Setup', link: '/guide-components/setup' },
          ],
        },
      ],
      '/guide-advanced/': [
        {
          text: 'Advanced',
          items: [
            { text: 'Overview', link: '/guide-advanced/' },
          ],
        },
      ],
      '/api/': [
        {
          text: '@vue/apollo-composable',
          link: '/api/',
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
