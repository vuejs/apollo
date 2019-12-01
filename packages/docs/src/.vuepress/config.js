module.exports = {
  base: '/',
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue Apollo',
      description: '🚀 Integrate GraphQL in your Vue.js apps!',
    },
    '/zh-cn/': {
      lang: 'zh-CN',
      title: 'Vue Apollo',
      description: '🚀 在你的 Vue.js 应用中集成 GraphQL！',
    }
  },
  plugins: {
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: {
        '/': {
          message: "New content is available.",
          buttonText: "Refresh"
        },
      },
    },
  },
  themeConfig: {
    repo: 'Akryum/vue-apollo',
    docsDir: 'docs',
    editLinks: true,
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        lastUpdated: 'Last Updated',
        nav: [
          {
            text: 'Guide',
            items: [
              {
                text: 'Getting started',
                link: '/guide/',
              },
              {
                text: 'Option API',
                link: '/guide-option/',
              },
              {
                text: 'Composition API',
                link: '/guide-composable/',
              },
              {
                text: 'Components',
                link: '/guide-components/',
              },
              {
                text: 'Advanced topics',
                link: '/guide-advanced/',
              },
            ],
          },
          {
            text: 'API Reference',
            link: '/api/',
          },
          {
            text: 'Migration',
            link: '/migration/',
          },
          {
            text: 'CLI plugin',
            link: 'https://github.com/Akryum/vue-cli-plugin-apollo',
          },
          {
            text: 'Sponsor',
            link: 'https://github.com/sponsors/Akryum',
          },
        ],
        sidebarDepth: 2,
        sidebar: {
          '/guide/': [
            '',
            'installation',
          ],
          '/guide-option/': [
            {
              title: 'Option API Guide',
              collapsable: false,
              children: [
                '',
                'setup',
              ],
            },
            {
              title: 'Basics',
              collapsable: false,
              children: [
                'usage',
                'queries',
                'mutations',
                'subscriptions',
              ],
            },
            {
              title: 'Advanced',
              collapsable: false,
              children: [
                'special-options',
                'pagination',
                'multiple-clients',
              ],
            },
          ],
          '/guide-composable/': [
            {
              title: 'Composition API Guide',
              collapsable: false,
              children: [
                '',
                'setup',
              ],
            },
            {
              title: 'Fetching data',
              collapsable: false,
              children: [
                'query',
                'mutation',
                'subscription',
                'pagination',
                'fragments',
                'error-handling',
              ],
            },
          ],
          '/guide-components/': [
            {
              title: 'Components Guide',
              collapsable: false,
              children: [
                '',
                'setup',
              ],
            },
            {
              title: 'Usage',
              collapsable: false,
              children: [
                'query',
                'mutation',
                'subscribe-to-more',
              ],
            },
          ],
          '/guide-advanced/': [
            {
              title: 'Advanced topics',
              collapsable: false,
              children: [
                '',
                'local-state',
                'ssr',
                'testing',
              ],
            },
          ],
          '/api/': [
            {
              title: 'Option API',
              collapsable: false,
              children: [
                'apollo-provider',
                'dollar-apollo',
                'smart-query',
                'smart-subscription',
              ],
            },
            {
              title: 'Components',
              collapsable: false,
              children: [
                'apollo-query',
                'apollo-mutation',
                'apollo-subscribe-to-more',
              ],
            },
            {
              title: 'Advanced',
              collapsable: false,
              children: [
                'ssr',
              ],
            },
          ],
          '/migration/': [''],
        },
      },
      '/zh-cn/': {
        selectText: '选择语言',
        label: '简体中文',
        editLinks: true,
        lastUpdated: '上次更新时间',
        nav: [
          {
            text: '指南',
            link: '/zh-cn/guide/',
          },
          {
            text: 'API 参考',
            link: '/zh-cn/api/',
          },
          {
            text: '迁移',
            link: '/zh-cn/migration/',
          },
          {
            text: 'CLI 插件',
            link: 'https://github.com/Akryum/vue-cli-plugin-apollo',
          },
          {
            text: '赞助作者',
            link: 'https://www.patreon.com/akryum',
          },
        ],
        sidebarDepth: 3,
        sidebar: {
          '/zh-cn/guide/': [
            '',
            'installation',
            {
              title: '基本使用',
              collapsable: false,
              children: [
                'apollo/',
                'apollo/queries',
                'apollo/mutations',
                'apollo/subscriptions',
                'apollo/pagination',
                'apollo/special-options',
              ],
            },
            {
              title: '组件',
              collapsable: false,
              children: [
                'components/',
                'components/query',
                'components/mutation',
                'components/subscribe-to-more',
              ],
            },
            {
              title: '进阶',
              collapsable: false,
              children: [
                'multiple-clients',
                'ssr',
                'local-state',
                'testing',
              ],
            },
          ],
          '/zh-cn/api/': [
            {
              title: 'Vue Apollo',
              collapsable: false,
              children: [
                'apollo-provider',
                'dollar-apollo',
                'ssr',
              ],
            },
            {
              title: 'Smart Apollo',
              collapsable: false,
              children: [
                'smart-query',
                'smart-subscription',
              ],
            },
            {
              title: 'Apollo 组件',
              collapsable: false,
              children: [
                'apollo-query',
                'apollo-mutation',
                'apollo-subscribe-to-more',
              ],
            },
          ],
          '/zh-cn/migration/': [''],
        },
      },
    },
  },
}
