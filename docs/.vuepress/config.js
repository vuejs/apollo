module.exports = {
    base: '/vue-apollo/',
    themeConfig: {
        docsDir: 'docs',
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Author', link: 'https://github.com/Akryum' },
        ],
        sidebar: [
            ['/docs/', 'Introduction'],
            ['/docs/installation', 'Installation'],
            ['/docs/create-provider', 'Create a provider'],
            ['/docs/usage-in-components', 'Usage in components'],
            ['/docs/queries', 'Queries'],
            ['/docs/mutations', 'Mutations'],
            ['/docs/subscriptions', 'Subscriptions'],
            ['/docs/pagination', 'Pagination with fetchMore'],
            ['/docs/special-options', 'Special options'],
            ['/docs/skip-all', 'Skip all'],
            ['/docs/multiple-clients', 'Multiple clients'],
            ['/docs/components', 'Components'],
            ['/docs/ssr', 'Server-Side Rendering'],
            ['/docs/local-state', 'Local state'],
            ['/docs/migration', 'Migration'],
            ['/docs/api-reference', 'API Reference'],

        ]
    },
    title: 'Apollo and GraphQL for Vue.js',
    description: 'Apollo and GraphQL plugin for Vue.js framework'
}