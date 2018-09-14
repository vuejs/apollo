module.exports = {
  base: '/vue-apollo/',
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
    },
    '/es-la/': {
      lang: 'es-LA',
      title: 'Vue Apollo',
      description: '🚀 Integre GraphQL en sus apps de Vue.js！',
    }
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
            link: '/guide/',
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
            text: 'Patreon',
            link: 'https://www.patreon.com/akryum',
          },
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
              ],
            },
            {
              title: 'Components',
              collapsable: false,
              children: [
                'components/',
                'components/query',
                'components/mutation',
                'components/subscribe-to-more',
              ],
            },
            {
              title: 'Advanced topics',
              collapsable: false,
              children: [
                'multiple-clients',
                'ssr',
                'local-state',
                'testing',
              ],
            },
          ],
          '/api/': [
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
              title: 'Apollo Components',
              collapsable: false,
              children: [
                'apollo-query',
                'apollo-subscribe-to-more',
                'apollo-mutation',
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
                'apollo-subscribe-to-more',
                'apollo-mutation',
              ],
            },
          ],
          '/zh-cn/migration/': [''],
        },
      },
      '/es-la/': {
        selectText: 'Idiomas',
        label: 'Epañol',
        lastUpdated: 'Última actualización',
        nav: [
          {
            text: 'Guía',
            link: '/es-la/guide/',
          },
          {
            text: 'Referencia API',
            link: '/es-la/api/',
          },
          {
            text: 'Migración',
            link: '/es-la/migration/',
          },
          {
            text: 'CLI plugin',
            link: 'https://github.com/Akryum/vue-cli-plugin-apollo',
          },
          {
            text: 'Patreon',
            link: 'https://www.patreon.com/akryum',
          },
        ],
        sidebarDepth: 3,
        sidebar: {
          '/es-la/guide/': [
            '',
            'installation',
            {
              title: 'Uso Básico',
              collapsable: false,
              children: [
                'apollo/',
                'apollo/queries',
                'apollo/mutations',
                'apollo/subscriptions',
                'apollo/pagination',
              ],
            },
            {
              title: 'Componentes',
              collapsable: false,
              children: [
                'components/',
                'components/query',
                'components/mutation',
                'components/subscribe-to-more',
              ],
            },
            {
              title: 'Avanzado',
              collapsable: false,
              children: [
                'multiple-clients',
                'ssr',
                'local-state',
                'testing',
              ],
            },
          ],
          '/es-la/api/': [
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
              title: 'Apollo Components',
              collapsable: false,
              children: [
                'apollo-query',
                'apollo-subscribe-to-more',
                'apollo-mutation',
              ],
            },
          ],
          '/es-la/migration/': [''],
        },
      },
    },
  },
}
