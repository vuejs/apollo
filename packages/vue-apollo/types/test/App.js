var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
// this example src is https://github.com/Akryum/vue-apollo-example
import gql from 'graphql-tag';
import Vue from 'vue';
var pageSize = 10;
var SUB_QUERY = gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["subscription tags($type: String!) {\n  tagAdded(type: $type) {\n    id\n    label\n    type\n  }\n}"], ["subscription tags($type: String!) {\n  tagAdded(type: $type) {\n    id\n    label\n    type\n  }\n}"])));
export default Vue.extend({
    data: function () {
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
        };
    },
    apollo: {
        $client: 'a',
        $query: {
            loadingKey: 'loading',
            fetchPolicy: 'cache-first'
        },
        tags: function () {
            return {
                query: gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["query tagList ($type: String!) {\n          tags(type: $type) {\n            id\n            label\n          }\n        }"], ["query tagList ($type: String!) {\n          tags(type: $type) {\n            id\n            label\n          }\n        }"]))),
                // Reactive variables
                variables: function () {
                    return {
                        type: this.type,
                    };
                },
                manual: true,
                pollInterval: 300,
                result: function (result) {
                    this.updateCount++;
                },
                skip: function () {
                    return this.skipQuery;
                },
                fetchPolicy: 'cache-and-network',
                subscribeToMore: [{
                        document: SUB_QUERY,
                        variables: function () {
                            return { type: this.type, };
                        },
                        updateQuery: function (previousResult, _a) {
                            var subscriptionData = _a.subscriptionData;
                            console.log('new tag', subscriptionData.data.tagAdded);
                            if (previousResult.tags.find(function (tag) { return tag.id === subscriptionData.data.tagAdded.id; })) {
                                return previousResult;
                            }
                            return {
                                tags: previousResult.tags.concat([
                                    subscriptionData.data.tagAdded,
                                ]),
                            };
                        },
                    }],
            };
        },
        randomTag: {
            query: function () {
                if (this.showTag === 'random') {
                    return gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["{\n            randomTag {\n              id\n              label\n              type\n            }\n          }"], ["{\n            randomTag {\n              id\n              label\n              type\n            }\n          }"])));
                }
                else if (this.showTag === 'last') {
                    return gql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["{\n            randomTag: lastTag {\n              id\n              label\n              type\n            }\n          }"], ["{\n            randomTag: lastTag {\n              id\n              label\n              type\n            }\n          }"])));
                }
            },
        },
        tagsPage: {
            // GraphQL Query
            query: gql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["query tagsPage ($page: Int!, $pageSize: Int!) {\n        tagsPage(page: $page, size: $pageSize) {\n          tags {\n            id\n            label\n            type\n          }\n          hasMore\n        }\n      }"], ["query tagsPage ($page: Int!, $pageSize: Int!) {\n        tagsPage(page: $page, size: $pageSize) {\n          tags {\n            id\n            label\n            type\n          }\n          hasMore\n        }\n      }"]))),
            variables: {
                page: 0,
                pageSize: pageSize,
            },
        },
    },
    methods: {
        addTag: function () {
            var _this = this;
            var newTag = this.newTag;
            this.$apollo.mutate({
                mutation: gql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["mutation ($type: String!, $label: String!) {\n          addTag(type: $type, label: $label) {\n            id\n            label\n          }\n        }"], ["mutation ($type: String!, $label: String!) {\n          addTag(type: $type, label: $label) {\n            id\n            label\n          }\n        }"]))),
                variables: { type: this.type, label: newTag, },
                updateQueries: {
                    tagList: function (previousResult, _a) {
                        var mutationResult = _a.mutationResult;
                        var data = mutationResult.data;
                        if (!data) {
                            return previousResult;
                        }
                        if (previousResult.tags.find(function (tag) { return tag.id === data.addTag.id; })) {
                            return previousResult;
                        }
                        return { tags: previousResult.tags.concat([data.addTag]) };
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
            }).then(function (data) {
                console.log(data);
            }).catch(function (error) {
                console.error(error);
                _this.newTag = newTag;
            });
        },
        showMore: function () {
            var _this = this;
            this.page++;
            this.$apollo.queries.tagsPage.fetchMore({
                variables: {
                    page: this.page,
                    pageSize: pageSize,
                },
                // Mutate the previous result
                updateQuery: function (previousResult, result) {
                    var fetchMoreResult = result.fetchMoreResult;
                    var newTags = fetchMoreResult.tagsPage.tags;
                    var hasMore = fetchMoreResult.tagsPage.hasMore;
                    _this.showMoreEnabled = hasMore;
                    return {
                        tagsPage: {
                            __typename: previousResult.tagsPage.__typename,
                            tags: previousResult.tagsPage.tags.concat(newTags),
                            hasMore: hasMore,
                        },
                    };
                },
            });
        },
        refetchTags: function () {
            this.$apollo.queries.tags.refetch();
        },
    },
    mounted: function () {
        var observer = this.$apollo.subscribe({
            query: SUB_QUERY,
            variables: {
                type: 'Companies',
            },
        });
        observer.subscribe({
            next: function (data) {
                console.log('this.$apollo.subscribe', data);
            },
        });
        // enable to specify client when execute request
        this.$apollo.query({ query: gql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["query mockQuery { id }"], ["query mockQuery { id }"]))), client: 'test' });
    },
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
