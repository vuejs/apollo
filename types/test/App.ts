// this example src is https://github.com/Akryum/vue-apollo-example
import gql from 'graphql-tag';
import Vue from 'vue';
const pageSize = 10;
const SUB_QUERY = gql`subscription tags($type: String!) {
  tagAdded(type: $type) {
    id
    label
    type
  }
}`;
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
    $loadingKey: 'loading',
    tags() {
      return {
        query: gql`query tagList ($type: String!) {
          tags(type: $type) {
            id
            label
          }
        }`,
        // Reactive variables
        variables () {
          return {
            type: this.type,
          };
        },
        manual: true,
        pollInterval: 300,
        result (result) {
          this.updateCount ++;
        },
        skip () {
          return this.skipQuery
        },
        fetchPolicy: 'cache-and-network',
        subscribeToMore: [{
          document: SUB_QUERY,
          variables () {
            return { type: this.type, }
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
      query () {
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
    },
  },
  methods: {
    addTag() {
      const newTag = this.newTag;
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
            const { data } = mutationResult;
            if (!data) { return previousResult }
            if (previousResult.tags.find((tag: any) => tag.id === data.addTag.id)) {
              return previousResult
            }
            return { tags: [ ...previousResult.tags, data.addTag ] };
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
        console.log(data);
      }).catch((error) => {
        console.error(error);
        this.newTag = newTag;
      });
    },
    showMore() {
      this.page ++;
      this.$apollo.queries.tagsPage.fetchMore({
        variables: {
          page: this.page,
          pageSize,
        },
        // Mutate the previous result
        updateQuery: (previousResult: any, result: { fetchMoreResult: any }) => {
          const { fetchMoreResult } = result;
          const newTags = fetchMoreResult.tagsPage.tags;
          const hasMore = fetchMoreResult.tagsPage.hasMore;
          this.showMoreEnabled = hasMore;
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
          };
        },
      });
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
    });
    observer.subscribe({
      next(data) {
        console.log('this.$apollo.subscribe', data);
      },
    });
  }, 
});