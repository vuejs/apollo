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
  themeConfig: {
    lastUpdated: true,
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
      { text: 'API', link: '/api/' },
    ],

    sidebar: {
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
