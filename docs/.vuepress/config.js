module.exports = {
  title: 'Apollo and GraphQL for Vue.js',
  description: '🚀 Integrate GraphQL in your Vue.js apps!',
  base: '/vue-apollo/',
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
  themeConfig: {
    repo: 'Akryum/vue-apollo',
    docsDir: 'docs',
    editLinks: true,
    lastUpdated: 'Last Updated',
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
        {
          title: 'Basic Usage',
          collapsable: false,
          children: [
            'apollo/',
            'apollo/queries',
            'apollo/mutations',
            'apollo/subscriptions',
            'apollo/pagination',
          ]
        },
        {
          title: 'Components',
          collapsable: false,
          children: [
            'components/',
            'components/query',
            'components/mutation',
            'components/subscribe-to-more',
          ]
        },
        {
          title: 'Advanced topics',
          collapsable: false,
          children: [
            'multiple-clients',
            'ssr',
            'local-state'
          ]
        }
      ],
      '/api/': [
        {
          title: 'Vue Apollo',
          collapsable: false,
          children: [
            'apollo-provider',
            'dollar-apollo',
            'ssr',
          ]
        },
        {
          title: 'Smart Apollo',
          collapsable: false,
          children: [
            'smart-query',
            'smart-subscription',
          ]
        },
        {
          title: 'Apollo Components',
          collapsable: false,
          children: [
            'apollo-query',
            'apollo-subscribe-to-more',
            'apollo-mutation',
          ]
        }
      ],
      '/migration/': [
        ''
      ]
    }
  }
}