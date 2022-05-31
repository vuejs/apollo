import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vue Apollo',
  description: 'Apollo/GraphQL integration for VueJS ',
  base: '/',
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
  },
  themeConfig: {
    repo: 'Akryum/vue-apollo',
    docsBranch: 'v4',
    docsDir: 'packages/docs/src',
    editLinks: true,
    editLinkText: 'Suggest changes to this page',
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
                text: 'Component API',
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
            {
              text: 'Introduction',
              link: '/guide/',
            },
            {
              text: 'Installation',
              link: '/guide/installation',
            },
          ],
          '/guide-option/': [
            {
              text: 'Option API Guide',
              collapsable: false,
              children: [
                {
                  text: 'Introduction',
                  link: '/guide-option/',
                },
                {
                  text: 'Setup',
                  link: '/guide-option/setup',
                },
              ],
            },
            {
              text: 'Basics',
              collapsable: false,
              children: [
                {
                  text: 'Usage in Vue components',
                  link: '/guide-option/usage',
                },
                {
                  text: 'Queries',
                  link: '/guide-option/queries',
                },
                {
                  text: 'Mutations',
                  link: '/guide-option/mutations',
                },
                {
                  text: 'Subscriptions',
                  link: '/guide-option/subscriptions',
                },
              ],
            },
            {
              text: 'Advanced',
              collapsable: false,
              children: [
                {
                  text: 'Special options',
                  link: '/guide-option/special-options',
                },
                {
                  text: 'Pagination',
                  link: '/guide-option/pagination',
                },
                {
                  text: 'Multiple clients',
                  link: '/guide-option/multiple-clients',
                },
              ],
            },
          ],
          '/guide-composable/': [
            {
              text: 'Composition API Guide',
              collapsable: false,
              children: [
                {
                  text: 'Introduction',
                  link: '/guide-composable/',
                },
                {
                  text: 'Setup',
                  link: '/guide-composable/setup',
                },
              ],
            },
            {
              text: 'Fetching data',
              collapsable: false,
              children: [
                {
                  text: 'Queries',
                  link: '/guide-composable/query',
                },
                {
                  text: 'Mutations',
                  link: '/guide-composable/mutation',
                },
                {
                  text: 'Subscriptions',
                  link: '/guide-composable/subscription',
                },
                {
                  text: 'Pagination',
                  link: '/guide-composable/pagination',
                },
                {
                  text: 'Fragments',
                  link: '/guide-composable/fragments',
                },
                {
                  text: 'Error handling',
                  link: '/guide-composable/error-handling',
                },
              ],
            },
          ],
          '/guide-components/': [
            {
              text: 'Components Guide',
              collapsable: false,
              children: [
                {
                  text: 'Introduction',
                  link: '/guide-components/',
                },
                {
                  text: 'Setup',
                  link: '/guide-components/setup',
                },
              ],
            },
            {
              text: 'Usage',
              collapsable: false,
              children: [
                {
                  text: 'Queries',
                  link: '/guide-components/query',
                },
                {
                  text: 'Mutations',
                  link: '/guide-components/mutation',
                },
                {
                  text: 'Subscribe to a Query',
                  link: '/guide-components/subscribe-to-more',
                },
              ],
            },
          ],
          '/guide-advanced/': [
            {
              text: 'Advanced topics',
              collapsable: false,
              children: [
                {
                  text: 'Local state',
                  link: '/guide-advanced/local-state',
                },
                {
                  text: 'Server-Side Rendering',
                  link: '/guide-advanced/ssr',
                },
                {
                  text: 'Testing',
                  link: '/guide-advanced/testing',
                },
              ],
            },
          ],
          '/api/': [
            {
              text: 'Option API',
              collapsable: false,
              children: [
                {
                  text: 'createApolloProvider',
                  link: '/api/apollo-provider',
                },
                {
                  text: '$apollo',
                  link: '/api/dollar-apollo',
                },
                {
                  text: 'Reactive queries',
                  link: '/api/smart-query',
                },
                {
                  text: 'Reactive subscriptions',
                  link: '/api/smart-subscription',
                },
              ],
            },
            {
              text: 'Composition API',
              collapsable: false,
              children: [
                {
                  text: 'useQuery',
                  link: '/api/use-query',
                },
                {
                  text: 'useLazyQuery',
                  link: '/api/use-lazy-query',
                },
                {
                  text: 'useMutation',
                  link: '/api/use-mutation',
                },
                {
                  text: 'useSubscription',
                  link: '/api/use-subscription',
                },
                {
                  text: 'useApolloClient',
                  link: '/api/use-apollo-client',
                },
                {
                  text: 'Loading utilities',
                  link: '/api/use-loading',
                },
              ],
            },
            {
              text: 'Components',
              collapsable: false,
              children: [
                {
                  text: '<ApolloQuery>',
                  link: '/api/apollo-query',
                },
                {
                  text: '<ApolloMutation>',
                  link: '/api/apollo-mutation',
                },
                {
                  text: '<ApolloSubscribeToMore>',
                  link: '/api/apollo-subscribe-to-more',
                },
              ],
            },
            {
              text: 'Advanced',
              collapsable: false,
              children: [
                {
                  text: 'ApolloSSR',
                  link: '/api/ssr',
                },
              ],
            },
          ],
          '/migration/': [
            {
              text: 'Migration guide',
              link: '/migration/',
            },
          ],
        },
      },
      '/zh-cn/': {
        selectText: '选择语言',
        label: '简体中文',
        lastUpdated: '上次更新时间',
        nav: [
          {
            text: '指南',
            items: [
              {
                text: '由此起步',
                link: '/zh-cn/guide/',
              },
              {
                text: '选项 API',
                link: '/zh-cn/guide-option/',
              },
              {
                text: '组合 API',
                link: '/zh-cn/guide-composable/',
              },
              {
                text: '组件 API',
                link: '/zh-cn/guide-components/',
              },
              {
                text: '进阶主题',
                link: '/zh-cn/guide-advanced/',
              },
            ],
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
            link: 'https://github.com/sponsors/Akryum',
          },
        ],
        sidebarDepth: 3,
        sidebar: {
          '/zh-cn/guide/': [
            {
              text: 'Introduction',
              link: '/zh-cn/guide/',
            },
            {
              text: 'Installation',
              link: '/zh-cn/guide/installation',
            },
          ],
          '/zh-cn/guide-option/': [
            {
              text: '选项 API 指南',
              collapsable: false,
              children: [
                {
                  text: 'Introduction',
                  link: '/zh-cn/guide-option/',
                },
                {
                  text: 'Setup',
                  link: '/zh-cn/guide-option/setup',
                },
              ],
            },
            {
              text: '基础',
              collapsable: false,
              children: [
                {
                  text: 'Usage in Vue components',
                  link: '/zh-cn/guide-option/usage',
                },
                {
                  text: 'Queries',
                  link: '/zh-cn/guide-option/queries',
                },
                {
                  text: 'Mutations',
                  link: '/zh-cn/guide-option/mutations',
                },
                {
                  text: 'Subscriptions',
                  link: '/zh-cn/guide-option/subscriptions',
                },
              ],
            },
            {
              text: '进阶',
              collapsable: false,
              children: [
                {
                  text: 'Special options',
                  link: '/zh-cn/guide-option/special-options',
                },
                {
                  text: 'Pagination',
                  link: '/zh-cn/guide-option/pagination',
                },
                {
                  text: 'Multiple clients',
                  link: '/zh-cn/guide-option/multiple-clients',
                },
              ],
            },
          ],
          '/zh-cn/guide-composable/': [
            {
              text: '组合 API 指南',
              collapsable: false,
              children: [
                {
                  text: 'Introduction',
                  link: '/zh-cn/guide-composable/',
                },
                {
                  text: 'Setup',
                  link: '/zh-cn/guide-composable/setup',
                },
              ],
            },
            {
              text: '获取数据',
              collapsable: false,
              children: [
                {
                  text: 'Queries',
                  link: '/zh-cn/guide-composable/query',
                },
                {
                  text: 'Mutations',
                  link: '/zh-cn/guide-composable/mutation',
                },
                {
                  text: 'Subscriptions',
                  link: '/zh-cn/guide-composable/subscription',
                },
                {
                  text: 'Pagination',
                  link: '/zh-cn/guide-composable/pagination',
                },
                {
                  text: 'Fragments',
                  link: '/zh-cn/guide-composable/fragments',
                },
                {
                  text: 'Error handling',
                  link: '/zh-cn/guide-composable/error-handling',
                },
              ],
            },
          ],
          '/zh-cn/guide-components/': [
            {
              text: '组件指南',
              collapsable: false,
              children: [
                {
                  text: 'Introduction',
                  link: '/zh-cn/guide-components/',
                },
                {
                  text: 'Setup',
                  link: '/zh-cn/guide-components/setup',
                },
              ],
            },
            {
              text: '用法',
              collapsable: false,
              children: [
                {
                  text: 'Queries',
                  link: '/zh-cn/guide-components/query',
                },
                {
                  text: 'Mutations',
                  link: '/zh-cn/guide-components/mutation',
                },
                {
                  text: 'Subscribe to a Query',
                  link: '/zh-cn/guide-components/subscribe-to-more',
                },
              ],
            },
          ],
          '/zh-cn/guide-advanced/': [
            {
              text: '进阶主题',
              collapsable: false,
              children: [
                {
                  text: 'Local state',
                  link: '/zh-cn/guide-advanced/local-state',
                },
                {
                  text: 'Server-Side Rendering',
                  link: '/zh-cn/guide-advanced/ssr',
                },
                {
                  text: 'Testing',
                  link: '/zh-cn/guide-advanced/testing',
                },
              ],
            },
          ],
          '/zh-cn/api/': [
            {
              text: '选项 API',
              collapsable: false,
              children: [
                {
                  text: 'createApolloProvider',
                  link: '/zh-cn/api/apollo-provider',
                },
                {
                  text: '$apollo',
                  link: '/zh-cn/api/dollar-apollo',
                },
                {
                  text: 'Reactive queries',
                  link: '/zh-cn/api/smart-query',
                },
                {
                  text: 'Reactive subscriptions',
                  link: '/zh-cn/api/smart-subscription',
                },
              ],
            },
            {
              text: '组合 API',
              collapsable: false,
              children: [
                {
                  text: 'useQuery',
                  link: '/zh-cn/api/use-query',
                },
                {
                  text: 'useLazyQuery',
                  link: '/zh-cn/api/use-lazy-query',
                },
                {
                  text: 'useMutation',
                  link: '/zh-cn/api/use-mutation',
                },
                {
                  text: 'useSubscription',
                  link: '/zh-cn/api/use-subscription',
                },
                {
                  text: 'useApolloClient',
                  link: '/zh-cn/api/use-apollo-client',
                },
                {
                  text: 'Loading utilities',
                  link: '/zh-cn/api/use-loading',
                },
              ],
            },
            {
              text: '组件',
              collapsable: false,
              children: [
                {
                  text: '<ApolloQuery>',
                  link: '/zh-cn/api/apollo-query',
                },
                {
                  text: '<ApolloMutation>',
                  link: '/zh-cn/api/apollo-mutation',
                },
                {
                  text: '<ApolloSubscribeToMore>',
                  link: '/zh-cn/api/apollo-subscribe-to-more',
                },
              ],
            },
            {
              text: '进阶',
              collapsable: false,
              children: [
                {
                  text: 'ApolloSSR',
                  link: '/zh-cn/api/ssr',
                },
              ],
            },
          ],
          '/zh-cn/migration/': [
            {
              text: 'Migration guide',
              link: '/zh-cn/migration/',
            },
          ],
        },
      },
    },
    algolia: {
      appId: 'X6FFODVB9N',
      apiKey: 'cc89b1eff7e2fc6e6c0bbf8b066ab488',
      indexName: 'apollo-vuejs',
    },
  },

  vite: {
    ssr: {
      noExternal: [
        'vue-github-button',
      ],
    },
  },
})
