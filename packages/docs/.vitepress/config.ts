import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import container from 'markdown-it-container'
import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/composable/typedoc-sidebar.json'
import { API_FLAVORS, DEFAULT_FLAVOR, STORAGE_KEY } from './apiFlavors.ts'

/**
 * Applies the stored flavor before first paint.
 *
 * Runs from `head`, so it beats hydration: without it every page would render the default
 * flavor and then visibly swap for anyone who picked another one.
 */
const flavorScript = `
try {
  var f = localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || ${JSON.stringify(DEFAULT_FLAVOR)}
  if (${JSON.stringify(API_FLAVORS.map(flavor => flavor.value))}.indexOf(f) !== -1) {
    document.documentElement.classList.add('api-pref-' + f)
  }
} catch (e) {}
`.trim()

/** Generated so `apiFlavors.ts` stays the only place a flavor is declared. */
const flavorStyle = [
  `html:not([class*='api-pref-']) .api-flavor--${DEFAULT_FLAVOR} { display: block }`,
  ...API_FLAVORS.flatMap(({ value }, index) => [
    `html.api-pref-${value} { --api-flavor-index: ${index} }`,
    `html.api-pref-${value} .api-flavor--${value} { display: block }`,
    `html.api-pref-${value} .api-preference__option[data-flavor='${value}'] { color: var(--vp-c-brand-1) }`,
  ]),
].join('\n')

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
      { text: 'Components', link: '/migration/components' },
    ],
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vue Apollo',
  description: 'Apollo/GraphQL integration for VueJS',
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        twoslashOptions: {
          /*
           * Drops one diagnostic from generated code the reader never sees.
           *
           * A template whose only root is one of our generic SFCs makes Vue language tools
           * read `$el` off that component's instance type, which under twoslash's setup
           * does not carry `ComponentPublicInstance`. `vue-tsc` checks the same examples
           * cleanly, so the example itself is fine.
           *
           * `filterNode` runs before error validation, so the node is gone rather than
           * merely expected. Scoped to this message so real 2339s still fail the build.
           */
          filterNode(node) {
            return !(node.type === 'error' && node.code === 2339 && node.text.includes('\'$el\''))
          },
        },
      }) as any,
    ],
    config(md) {
      /*
       * One container per flavor, `:::: composition-api` to `::::`, shown or hidden by CSS.
       *
       * Written with four colons rather than three so a flavor block can wrap the
       * three-colon containers (`code-group`, `tip`, `warning`) it usually needs to.
       * markdown-it-container only nests when the outer marker is the longer one.
       */
      for (const { value } of API_FLAVORS) {
        md.use(container, `${value}-api`, {
          render: (tokens: { nesting: number }[], index: number) =>
            tokens[index].nesting === 1
              ? `<div class="api-flavor api-flavor--${value}">\n`
              : '</div>\n',
        })
      }
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['script', {}, flavorScript],
    ['style', {}, flavorStyle],
  ],
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
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: '@vue/apollo-composable', link: '/api/composable/' },
          { text: '@vue/apollo-components', link: '/api/components/' },
        ],
      },
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
      '/api/': [
        {
          text: 'API Reference',
          link: '/api/',
          items: [
            { text: '@vue/apollo-composable', link: '/api/composable/' },
            { text: '@vue/apollo-components', link: '/api/components/' },
          ],
        },
      ],
      '/api/composable/': [
        {
          text: '@vue/apollo-composable',
          link: '/api/composable/',
          items: typedocSidebar,
        },
      ],
      '/api/components/': [
        {
          text: '@vue/apollo-components',
          link: '/api/components/',
          items: [
            { text: 'ApolloQuery', link: '/api/components/ApolloQuery' },
            { text: 'ApolloMutation', link: '/api/components/ApolloMutation' },
            { text: 'ApolloSubscription', link: '/api/components/ApolloSubscription' },
            { text: 'ApolloSubscribeToMore', link: '/api/components/ApolloSubscribeToMore' },
            { text: 'ApolloFragment', link: '/api/components/ApolloFragment' },
          ],
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
