// this example src is https://github.com/Akryum/vue-apollo-example
import gql from 'graphql-tag'
import Vue from 'vue'
import { OperationVariables, ApolloQueryResult } from '@apollo/client/core'
import { VueApolloQueryDefinition } from '../options'
import { DocumentNode } from 'graphql'

const pageSize = 10

const SUB_QUERY = gql`subscription tags($type: String!) {
  tagAdded(type: $type) {
    id
    label
    type
  }
}`

interface Foo {
  foo: string
}

interface HelloVars {
  hello: string
}

interface FooResult {
  foo: {
    bar: string
  }
}

export const hey = Vue.extend({
  props: {
    meow: String,
  },

  data () {
    return {
      waf: 'waf',
      loading: 0
    }
  },

  apollo: {
    $client: 'foo',
    $query: {
      fetchPolicy: 'cache-only'
    },
    foo: gql`query`,
    message: {
      query: gql`query`,
      // https://vuejs.org/v2/guide/typescript.html#Annotating-Return-Types
      variables (): HelloVars {
        this.hello.toUpperCase()
        this.meow
        return {
          hello: this.hello.toUpperCase()
        }
      },
      update: (data: FooResult) => data.foo.bar,
      result (result: ApolloQueryResult<FooResult>, key) {
        this.meow
        console.log(result.data.foo.bar.toUpperCase())
        console.log(this.hello.toUpperCase())
        console.log(key)
      },
      error (error) {
        console.error(error.graphQLErrors, error.networkError)
      },
      manual: false,
      loadingKey: 'loading',
      watchLoading (isLoading, countModifier) {
        this.loading += countModifier
        if (isLoading) {
          console.log('isLoading')
        }
      },
      // https://vuejs.org/v2/guide/typescript.html#Annotating-Return-Types
      skip (): boolean {
        return this.meow === 'meow'
      },
      prefetch: true,
      client: 'api2',
      deep: true,
      /* Apollo options */
      fetchPolicy: 'cache-only',
      errorPolicy: 'all',
      returnPartialData: true,
      /* Subscriptions */
      subscribeToMore: {
        document: gql`subscription`,
        // https://vuejs.org/v2/guide/typescript.html#Annotating-Return-Types
        variables (): OperationVariables {
          return {
            foo: this.hello,
          }
        },
        updateQuery (previousResult, options) {
          return {
            ...previousResult,
            foo: options.subscriptionData.data.foo
          }
        }
      }
    },

    testMultiSubs: {
      query: gql`query`,
      variables (): HelloVars {
        return {
          hello: this.hello,
        }
      },
      subscribeToMore: [
        {
          document: gql`subscription`,
          variables: {
            foo: 'bar'
          },
          updateQuery (previousResult, options) {
            return {
              ...previousResult,
              foo: options.subscriptionData.data.foo
            }
          }
        },
        {
          document: gql`subscription`,
          // https://vuejs.org/v2/guide/typescript.html#Annotating-Return-Types
          variables (): HelloVars {
            return {
              // Typescript Bug: https://github.com/microsoft/TypeScript/issues/33392
              // @ts-ignore
              hello: this.hello,
            }
          },
          updateQuery (previousResult, options) {
            return {
              ...previousResult,
              foo: options.subscriptionData.data.foo
            }
          }
        }
      ],
    },

    tags (): VueApolloQueryDefinition<FooResult, HelloVars> {
      this.hello.toUpperCase()
      this.meow
      return {
        query: gql`query`,
        // https://vuejs.org/v2/guide/typescript.html#Annotating-Return-Types
        variables: () => {
          this.hello.toUpperCase()
          this.meow
          return {
            hello: this.hello.toUpperCase()
          }
        },
        result: (result) => {
          console.log(this.hello.toUpperCase())
          console.log(result.data.foo.bar.toUpperCase())
        },
        subscribeToMore: [
          {
            document: gql``,
            variables: () => ({
              hello: this.hello.toUpperCase()
            }),
          },
        ],
      }
    },

    $subscribe: {
      tagAdded: {
        query: gql`subscription`,
        variables (): OperationVariables {
          return {
            foo: this.meow
          }
        },
        client: 'foo'
      }
    }
  },

  computed: {
    // https://vuejs.org/v2/guide/typescript.html#Annotating-Return-Types
    hello (): string {
      return this.waf === 'waf' ? 'waf waf' : 'hello'
    }
  },

  async created () {
    const { data } = await this.$apollo.mutate<Foo, HelloVars>({
      mutation: gql`mutation {}`,
      variables: {
        hello: this.hello
      },
    })
    if (data) {
      console.log(data.foo)
    }
    this.hello.toUpperCase()
    this.$apollo.vm.hello.toUpperCase()
  }
})

export default Vue.extend({
  data () {
    return {
      newTag: null,
      updateCount: 0,
      type: 'City',
      skipQuery: false,
      loading: 0,
      tagsLoading: 0,
      tagsPageLoading: 0,
      showTag: 'random',
      showMoreEnabled: true,
      page: 0,
      _type: ''
    }
  },
  apollo: {
    $client: 'a',
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-first',
    },
    tags(): VueApolloQueryDefinition {
      return {
        query: gql`query tagList ($type: String!) {
          tags(type: $type) {
            id
            label
          }
        }`,
        // Reactive variables
        variables: (): OperationVariables => {
          return {
            type: this.type,
          }
        },
        manual: true,
        pollInterval: 300,
        result: (result) => {
          this.updateCount ++
        },
        skip: (): boolean => {
          return this.skipQuery
        },
        fetchPolicy: 'cache-and-network',
        subscribeToMore: [{
          document: SUB_QUERY,
          variables: (): OperationVariables => {
            return {
              type: this.type,
            }
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            console.log('new tag', subscriptionData.data.tagAdded)
            if (previousResult.tags.find((tag: any) => tag.id === subscriptionData.data.tagAdded.id)) {
              return previousResult
            }
            return {
              tags: [
                ...previousResult.tags,
                subscriptionData.data.tagAdded,
              ],
            }
          },
        }],
      }
    },
    randomTag: {
      query (): DocumentNode | null {
        if (this.showTag === 'random') {
          return gql`{
            randomTag {
              id
              label
              type
            }
          }`
        } else if (this.showTag === 'last') {
          return gql`{
            randomTag: lastTag {
              id
              label
              type
            }
          }`
        }
        return null
      },
    },
    tagsPage: {
      // GraphQL Query
      query: gql`query tagsPage ($page: Int!, $pageSize: Int!) {
        tagsPage(page: $page, size: $pageSize) {
          tags {
            id
            label
            type
          }
          hasMore
        }
      }`,
      variables: {
        page: 0,
        pageSize,
      },
      result (result) {
        console.log(result)
        console.log(this.loading)
      },
    },
  },
  methods: {
    addTag() {
      const newTag = this.newTag
      this.$apollo.mutate({
        mutation: gql`mutation ($type: String!, $label: String!) {
          addTag(type: $type, label: $label) {
            id
            label
          }
        }`,
        variables: { type: this.type, label: newTag, },
        updateQueries: {
          tagList: (previousResult, { mutationResult }) => {
            const { data } = mutationResult
            if (!data) { return previousResult }
            if (previousResult.tags.find((tag: any) => tag.id === data.addTag.id)) {
              return previousResult
            }
            return { tags: [ ...previousResult.tags, data.addTag ] }
          },
        },
        optimisticResponse: {
          __typename: 'Mutation',
          addTag: {
            __typename: 'Tag',
            id: -1,
            label: newTag,
            type: this.type,
          },
        },
      }).then((data) => {
        console.log(data)
      }).catch((error) => {
        console.error(error)
        this.newTag = newTag
      })
    },
    showMore() {
      this.page ++
      this.$apollo.queries.tagsPage.fetchMore({
        variables: {
          page: this.page,
          pageSize,
        },
        // Mutate the previous result
        updateQuery: (previousResult: any, result: { fetchMoreResult?: any }) => {
          const { fetchMoreResult } = result
          const newTags = fetchMoreResult.tagsPage.tags
          const hasMore = fetchMoreResult.tagsPage.hasMore
          this.showMoreEnabled = hasMore
          return {
            tagsPage: {
              __typename: previousResult.tagsPage.__typename,
              tags: [
                ...previousResult.tagsPage.tags,
                // Add the new tags
                ...newTags,
              ],
              hasMore,
            },
          }
        },
      })
    },
    refetchTags () {
      this.$apollo.queries.tags.refetch()
    },
  },
  mounted() {
    const observer = this.$apollo.subscribe({
      query: SUB_QUERY,
      variables: {
        type: 'Companies',
      },
    })
    observer.subscribe({
      next(data) {
        console.log('this.$apollo.subscribe', data)
      },
    })

    // enable to specify client when execute request
    this.$apollo.query({ query: gql`query mockQuery { id }`, client: 'test' })
  }, 
})
