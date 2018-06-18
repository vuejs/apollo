module.exports = {
  base: '/vue-apollo/',
  themeConfig: {
    repo: 'Akryum/vue-apollo',
    docsDir: 'docs',
    editLinks: true,
    nav: [
      {
        text: 'Guide',
        link: '/guide/'
      },
      {
        text: 'API Reference',
        link: '/api/'
      },
      {
        text: 'Migration',
        link: '/migration/'
      },
      {
        text: 'CLI plugin',
        link: 'https://github.com/Akryum/vue-cli-plugin-apollo'
      },
      {
        text: 'Patreon',
        link: 'https://www.patreon.com/akryum'
      }
    ],
    sidebarDepth: 3,
    sidebar: {
      '/guide/': [
        '',
        'installation',
        'create-provider',
        'usage-in-components',
        'queries',
        'mutations',
        'subscriptions',
        'pagination',
        'special-options',
        'skip-all',
        'multiple-clients',
        'components',
        'ssr',
        'local-state'
      ],
      '/api/': [
        'apollo-provider',
        'apollo-query',
        'apollo-subscribe-to-more',
        'apollo-mutation',
        'dollar-apollo',
        'smart-query',
        'smart-subscription',
      ],
      '/migration/': [
        ''
      ]
    }
  },
  title: 'Apollo and GraphQL for Vue.js',
  description: '🚀 Apollo and GraphQL plugin for Vue.js framework'
}