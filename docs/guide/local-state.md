# Local state

## Why use Apollo local state management?

When you perform GraphQL queries with Apollo, the results of API calls will be stored in **Apollo cache**. Now imagine you also need to store some kind of a local application state and make it available for different components. Usually, in Vue we do with [Vuex](TODO). But having both Apollo and Vuex will mean you store your data in two different places so you have _two sources of truth_.

Good thing is Apollo has a mechanism of storing local application data to cache. Previously, it used an [apollo-link-state](https://github.com/apollographql/apollo-link-state) library for this. Since Apollo 2.5 release this functionality was included to Apollo core.

## Initializing an Apollo cache

---
