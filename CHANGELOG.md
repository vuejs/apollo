# Changelog

## v4.0.0-beta.9


### 🩹 Fixes

  - Don't call debounced restart too much (1adf135)

### 🏡 Chore

  - Update throttle-debounce (500cc49)
  - Update deps (f47759e)

### ❤️  Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v4.0.0-beta.8


### 🚀 Enhancements

  - **useQuery:** Nullable query (auto disable) (28f3520)

### ❤️  Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v4.0.0-beta.7


### 🩹 Fixes

  - **ssr:** Hydration mismatch with keepPreviousResult (87188c4)

### ❤️  Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v4.0.0-beta.6


### 🚀 Enhancements

  - KeepPreviousResult (e794c1e)

### 📖 Documentation

  - ProvideApolloClient (#1442)

### 🏡 Chore

  - Update graphql to 16 in repo (4dcfa20)
  - Typo in test component file (bfca616)
  - Update lockfile version (2077502)

### ✅ Tests

  - Update server (13bfbbe)
  - Update pnpm version (722fa0f)
  - Test-server package (f1ebe70)
  - Migrate server to typescript (97c1402)
  - Fix (c881439)

### ❤️  Contributors

- Stefan Schneider <stefan.schneider@gmx.net>
- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v4.0.0-beta.5


### 🚀 Enhancements

  - UseLazyQuery load returns boolean to make is easier to refetch (dcb1768)
  - **ts:** Update types to account for changes in TypeScript 4.8 (#1454)
  - Allow global tracking outside of components (5967e16)

### 🩹 Fixes

  - Don't call variables if query is disabled + fix enabling race conditions, fix #1243, fix #1422 (#1243, #1422)
  - Events not registered in case of immediate trigger, fix #1154 (#1154)
  - @vue/apollo-composable ESM settings, fix #1462 (#1463, #1462)
  - Avoid multiple on error calls without usage of errorPolicy 'all' (#1461)
  - Ssr export paths, fix #1469 (#1469)
  - Initialize currentDocument early, fix #1325 (#1325)
  - **ts:** Allow null on `userLazyQuery` `load` fn, fix #1386 (#1386)
  - **ssr:** Handle result/error set before serverPrefetch call, fix #1429 (#1429)

### 📖 Documentation

  - Subscriptions configuration docs updated to describe graphql-ws configuration. (#1449)

### 🏡 Chore

  - Update lockfile to v6.0 (81ea32c)
  - Update sheep/release-tag (cf7917e)

### ✅ Tests

  - Config cypress downloads (32c95de)
  - Demo useLazyQuery with immediate load (53554b8)
  - Enabled (db7d79c)

### 🤖 CI

  - Switch to github actions (25c31d2)
  - Enable on v4 branch (bc3d80c)

### ❤️  Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))
- Gibran Amparan ([@gibranamparan](http://github.com/gibranamparan))
- Alessia Bellisario <alessia@apollographql.com>
- Dominik Klein <dk@zammad.com>
- Changwan Jun ([@wan2land](http://github.com/wan2land))


# [4.0.0-beta.4](https://github.com/vuejs/vue-apollo/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2023-02-22)


### Features

* improve ESM support ([2623b32](https://github.com/vuejs/vue-apollo/commit/2623b32d6c999cfa677b3b36969bd6b5b782d387))



# [4.0.0-beta.3](https://github.com/vuejs/vue-apollo/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2023-02-21)


### Bug Fixes

* **ssr:** error not bubbling up ([18fe206](https://github.com/vuejs/vue-apollo/commit/18fe206761eba0af05971dff34113d5396e6e6bf))



# [4.0.0-beta.2](https://github.com/vuejs/vue-apollo/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2023-02-03)


### Bug Fixes

* **@vue/apollo-option:** ssr cleanup function fails to run ([#1424](https://github.com/vuejs/vue-apollo/issues/1424)) ([#1425](https://github.com/vuejs/vue-apollo/issues/1425)) ([8dfe93b](https://github.com/vuejs/vue-apollo/commit/8dfe93b82679fac42b8d1509febc97e7faeed1e0))
* hydration error, revert [#1388](https://github.com/vuejs/vue-apollo/issues/1388), fix [#1432](https://github.com/vuejs/vue-apollo/issues/1432) ([9302d4d](https://github.com/vuejs/vue-apollo/commit/9302d4d4a55541bb49292463d8176d0527c06ce9))
* ignore next result only if not loading ([1e24d21](https://github.com/vuejs/vue-apollo/commit/1e24d2110c3ea6ee80590c2b6578fef45a2e448e))
* typo in useResult deprecation message ([#1414](https://github.com/vuejs/vue-apollo/issues/1414)) ([3728928](https://github.com/vuejs/vue-apollo/commit/372892855d76622128ac560e8fadc689c50675bc))



# [4.0.0-beta.1](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.20...v4.0.0-beta.1) (2022-10-05)


### Bug Fixes

* **composable:** Remove immediate result logic ([#1388](https://github.com/vuejs/vue-apollo/issues/1388)) ([fc98307](https://github.com/vuejs/vue-apollo/commit/fc983077dcf89e10b4eb88731eee77b375a8a85f))



# [4.0.0-alpha.20](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.19...v4.0.0-alpha.20) (2022-07-19)


### Reverts

* Revert "fix(options): use beforeUnmount instead of unmounted" ([8d51475](https://github.com/vuejs/vue-apollo/commit/8d51475f40c8605d0187180063487173c52167ba))



# [4.0.0-alpha.19](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.18...v4.0.0-alpha.19) (2022-07-18)


### Bug Fixes

* **options:** use beforeUnmount instead of unmounted ([9726e0a](https://github.com/vuejs/vue-apollo/commit/9726e0a8655053789dc1b68103f282f6ef0c1d95))
* Root instance not found when using with Vue 2.7 ([#1379](https://github.com/vuejs/vue-apollo/issues/1379)) ([cb0ab57](https://github.com/vuejs/vue-apollo/commit/cb0ab5790514ae10ea5e7bab381199f65b8107d5))
* **ssr:** mock $apollo after serverPrefetch, fix [#1297](https://github.com/vuejs/vue-apollo/issues/1297) ([46ea781](https://github.com/vuejs/vue-apollo/commit/46ea78117adfc81a59219df1a8560c21fa0ad7be))



# [4.0.0-alpha.18](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.17...v4.0.0-alpha.18) (2022-06-23)


### Bug Fixes

* apollo components registered twice, fix [#1336](https://github.com/vuejs/vue-apollo/issues/1336) ([3ad3ab3](https://github.com/vuejs/vue-apollo/commit/3ad3ab3ddaf5ffafe5297afac904c2f364f50c96))
* change data init, related to [#1350](https://github.com/vuejs/vue-apollo/issues/1350) ([b94bdf7](https://github.com/vuejs/vue-apollo/commit/b94bdf7e79d0d861073df6e974a63b460f0963ac))
* Make calls of the refetch() & fetchMore() trigger loading state ([#1366](https://github.com/vuejs/vue-apollo/issues/1366)) ([a32fe9c](https://github.com/vuejs/vue-apollo/commit/a32fe9c469e74d619a36d8df1d2db92c1a9cdb47))
* vue-demi updated ([#1373](https://github.com/vuejs/vue-apollo/issues/1373)) ([e959a2c](https://github.com/vuejs/vue-apollo/commit/e959a2ccd4310fba22be556f289d97d2c4de379d))



# [4.0.0-alpha.17](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.16...v4.0.0-alpha.17) (2022-05-03)


### Bug Fixes

* $apollo null error if smar obj is destroyed but has throttled/debounced calls ([d6d4da1](https://github.com/vuejs/vue-apollo/commit/d6d4da16d56233e1c6fb4df261cda4a0b9f665d4))
* added client options to error policy ([#1318](https://github.com/vuejs/vue-apollo/issues/1318)) ([61261bc](https://github.com/vuejs/vue-apollo/commit/61261bccc4639a1d2394413464d46d6032ec4c87))
* avoid onServerPrefetch warning ([#1281](https://github.com/vuejs/vue-apollo/issues/1281)) ([cf89b25](https://github.com/vuejs/vue-apollo/commit/cf89b252c214401621674c654f0864229b3a6be3))
* remove console.log ([a79b790](https://github.com/vuejs/vue-apollo/commit/a79b7908f6e4ae3120d11318a6643b724e5718cd))
* subscriptions array leak ([#1248](https://github.com/vuejs/vue-apollo/issues/1248)) ([f31fa15](https://github.com/vuejs/vue-apollo/commit/f31fa1520c2fe007dd47474268ea274bc2906866))
* useQuery loading and debounce issues ([#1313](https://github.com/vuejs/vue-apollo/issues/1313)) ([082acf9](https://github.com/vuejs/vue-apollo/commit/082acf90c2c22edf28f443306da39b535d2b0a1d)), closes [#1235](https://github.com/vuejs/vue-apollo/issues/1235) [#1271](https://github.com/vuejs/vue-apollo/issues/1271)


### Features

* allow providing multiple apolloClients outside of setup/vue context in vue-apollo-composable ([#1340](https://github.com/vuejs/vue-apollo/issues/1340)) ([64491ce](https://github.com/vuejs/vue-apollo/commit/64491ce1ca0f1a6a3acc498a1999e85347336748))
* deprecate useResult ([0e9fb48](https://github.com/vuejs/vue-apollo/commit/0e9fb48384647e2d8a825b72cadeb8ff74396294))
* update vue-demi ([af9f20f](https://github.com/vuejs/vue-apollo/commit/af9f20f131667f173c9708a375e24d676c7adf95))



# [4.0.0-alpha.16](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.15...v4.0.0-alpha.16) (2021-11-28)


### Bug Fixes

* destruction of $apollo in vue-apollo-option ([#1273](https://github.com/vuejs/vue-apollo/issues/1273)) ([e2dad14](https://github.com/vuejs/vue-apollo/commit/e2dad14ec8df636623f04f67b8b9561ce497ec19))
* duplicate call to catchError, closes [#1133](https://github.com/vuejs/vue-apollo/issues/1133) ([eaf1da7](https://github.com/vuejs/vue-apollo/commit/eaf1da7c393bae88c1cce950e27baaff64c09764))
* improve peerDeps declaration, closes [#1263](https://github.com/vuejs/vue-apollo/issues/1263) ([3c8545b](https://github.com/vuejs/vue-apollo/commit/3c8545b8957caeed9bffd73fbe2fa8e2bbf09654))
* useMutation outside setup ([#1262](https://github.com/vuejs/vue-apollo/issues/1262)) ([9b3af01](https://github.com/vuejs/vue-apollo/commit/9b3af018f5ddde0817b4d5049589d0be88c9a913))
* **useQuery:** improve error handling with errorPolicy set to 'all' ([04ab9f6](https://github.com/vuejs/vue-apollo/commit/04ab9f6e869ac18464bdf33fcba76cc8a1ddb8d4))
* useSubscription outside of component ([a37a560](https://github.com/vuejs/vue-apollo/commit/a37a560ca55bc4c2c852a8b0a877cb49012885c5))


### Features

* upgrade dependencies ([0595bd3](https://github.com/vuejs/vue-apollo/commit/0595bd393eb69a342232713284dd7fe8857c61e1))



# [4.0.0-alpha.15](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.14...v4.0.0-alpha.15) (2021-09-20)


### Bug Fixes

* apollo-client 3.4 FetchMoreQueryOptions, closes [#1252](https://github.com/vuejs/vue-apollo/issues/1252) ([e0786ac](https://github.com/vuejs/vue-apollo/commit/e0786acda0f302bd4275b1f9dd4be66ea0d0ac9d))
* don't use internal merge strat, closes [#1229](https://github.com/vuejs/vue-apollo/issues/1229) ([e1026a3](https://github.com/vuejs/vue-apollo/commit/e1026a344f36d8d5b19674fe11288b9b8b8014e0))
* remove $isServer, closes [#1241](https://github.com/vuejs/vue-apollo/issues/1241) ([1180679](https://github.com/vuejs/vue-apollo/commit/11806792363cd754e98157d8a215ab0dabce913d))
* **smart apollo:** ensure SmartQuery variables still function when watched expression evaluated ([#1161](https://github.com/vuejs/vue-apollo/issues/1161)), closes [#991](https://github.com/vuejs/vue-apollo/issues/991) ([b67ff78](https://github.com/vuejs/vue-apollo/commit/b67ff78d6a595d9ec67382e74aaffef12439db4a))
* **SubscribeToMore:** use beforeUnmount ([a90840c](https://github.com/vuejs/vue-apollo/commit/a90840c288f031eab4a97a1673d88280bdde924e))
* **types:** add throttle and debounce options ([#1258](https://github.com/vuejs/vue-apollo/issues/1258)) ([7ffb5f8](https://github.com/vuejs/vue-apollo/commit/7ffb5f8c9da899620c85eb5e26d5447e3fb74f62)), closes [vuejs#335](https://github.com/vuejs/issues/335)
* **useApolloClient:** save current client in closure, closes [#1249](https://github.com/vuejs/vue-apollo/issues/1249) ([fb18286](https://github.com/vuejs/vue-apollo/commit/fb18286177bb9b7e9161b167d15a8da2b2a3b94b))
* **useQuery:** reset error on refetch/fetchMore, closes [#1105](https://github.com/vuejs/vue-apollo/issues/1105) ([ea123fa](https://github.com/vuejs/vue-apollo/commit/ea123fa414dc4a4e116dd6d3bc70656f50d831c6))
* **useResult:** data => data deep required & non-nullable, closes [#1250](https://github.com/vuejs/vue-apollo/issues/1250) ([4475805](https://github.com/vuejs/vue-apollo/commit/4475805cb6dd48a1f0bdaa8df60432ebdc9963cd))
* vue peerDependencies, closes [#1234](https://github.com/vuejs/vue-apollo/issues/1234) ([a35b04f](https://github.com/vuejs/vue-apollo/commit/a35b04ff05cbdf2e286e5830e9a23b0d5c2ad6f4))



# [4.0.0-alpha.14](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.13...v4.0.0-alpha.14) (2021-07-19)


### Bug Fixes

* importing react -_-' ([f53bcde](https://github.com/vuejs/vue-apollo/commit/f53bcdec5bfbfc27d24398b163050f7774888600))
* **mixin:** use unmounted instead of destroyed ([335d538](https://github.com/vuejs/vue-apollo/commit/335d538dd31fa91b42d024c594ce3513791096b2))
* reference error, when using useQuery ([#1218](https://github.com/vuejs/vue-apollo/issues/1218)) ([08b6b0e](https://github.com/vuejs/vue-apollo/commit/08b6b0e7d9678d051c22d6929c3155f07a720570))
* target es2018, closes [#1220](https://github.com/vuejs/vue-apollo/issues/1220) ([e496ba2](https://github.com/vuejs/vue-apollo/commit/e496ba26047293100e26f196285b597d6ee64c2d))


### Features

* convert errors into ApolloError ([#1225](https://github.com/vuejs/vue-apollo/issues/1225)) ([334310d](https://github.com/vuejs/vue-apollo/commit/334310d5e69e83d0079372f5d1a8250a0d2af632))



# [4.0.0-alpha.13](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.12...v4.0.0-alpha.13) (2021-07-04)


### Bug Fixes

* build ([f81f2d4](https://github.com/vuejs/vue-apollo/commit/f81f2d4db2fa10da77e600fb9724ce12de925d71))
* **composable:** Clear previous error when recieving a result ([#1120](https://github.com/vuejs/vue-apollo/issues/1120)) ([689c284](https://github.com/vuejs/vue-apollo/commit/689c2842075922390366adc0e2f471a87e6eb17f))
* don't track loading outside of vm, closes [#1145](https://github.com/vuejs/vue-apollo/issues/1145) ([35940d1](https://github.com/vuejs/vue-apollo/commit/35940d120dbed0cd1c1a6181984f029c40455273))
* remove ApolloProvider.provide ([40ddcb9](https://github.com/vuejs/vue-apollo/commit/40ddcb99eb05a0161e338576279bbb4b04457197))
* **useQuery:** apply partial result on start ([62fa842](https://github.com/vuejs/vue-apollo/commit/62fa8429d8af1c9456179d5470c7f656311ff843))


### Features

* **composable:** Type MutateOverrideOptions ([4c51cb4](https://github.com/vuejs/vue-apollo/commit/4c51cb44156c42213275e9cc4323614a692b1f25))
* options & components API for Vue 3 ([8a70c95](https://github.com/vuejs/vue-apollo/commit/8a70c95bf7f0e722a0679731c3f122e78c2d9839))



# [4.0.0-alpha.12](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.11...v4.0.0-alpha.12) (2020-10-17)


### Features

* useLazyQuery, closes [#1068](https://github.com/vuejs/vue-apollo/issues/1068) ([8e95aea](https://github.com/vuejs/vue-apollo/commit/8e95aea00fe5a9d01c290262c6684c7c3b615ab0))



# [4.0.0-alpha.11](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.10...v4.0.0-alpha.11) (2020-10-17)


### Bug Fixes

* clean imports ([97be1e2](https://github.com/vuejs/vue-apollo/commit/97be1e272259198c2915b3b7d69bff96ac3f61f2))
* **error log:** only import graphq printer, closes [#994](https://github.com/vuejs/vue-apollo/issues/994) ([5eb9506](https://github.com/vuejs/vue-apollo/commit/5eb95063595876f90fa36a36d0814cfbf740ca4e))
* more updates to apollo-client 3 ([fae0229](https://github.com/vuejs/vue-apollo/commit/fae022905cf42aec258997d2c9296e6f2674c0d3))
* resolveClient use id arg ([4a9e959](https://github.com/vuejs/vue-apollo/commit/4a9e959c06ee8eadd3c29fe22a04703ec3be033a))
* **ssr:** code broken by eslint fix ([f1279d8](https://github.com/vuejs/vue-apollo/commit/f1279d8dad816fcbcab9a4e3a28b3af473656330))
* support Vue 3 vm.root ([#1040](https://github.com/vuejs/vue-apollo/issues/1040)) ([957aae3](https://github.com/vuejs/vue-apollo/commit/957aae33908cca6bda980cabfc3b156f6f940755))
* unresolved promises in ssr ([#940](https://github.com/vuejs/vue-apollo/issues/940)) ([#1069](https://github.com/vuejs/vue-apollo/issues/1069)) ([8a71443](https://github.com/vuejs/vue-apollo/commit/8a714431b2a04a008ef698a7d39eb53c8f6585b8))
* **useApolloClient:** add id arg to resolveClient ([72d7402](https://github.com/vuejs/vue-apollo/commit/72d7402eb29893a7e63fc675a8057a8f5a4a825f))
* **useApolloClient:** clientId arg not working, closes [#1023](https://github.com/vuejs/vue-apollo/issues/1023) ([65d1984](https://github.com/vuejs/vue-apollo/commit/65d1984ecdd67371db3aa0cd6f8814d6709eb15a))
* useEventHook param is not optional ([#1027](https://github.com/vuejs/vue-apollo/issues/1027)) ([1d2f4f3](https://github.com/vuejs/vue-apollo/commit/1d2f4f32991325a5fc53e193e1dfed0faa040441))
* **useQuery:** use nextTick to support Vue 3 ([#1041](https://github.com/vuejs/vue-apollo/issues/1041)) ([c9ee0ec](https://github.com/vuejs/vue-apollo/commit/c9ee0ec645fd876caf4564f46a904f91780e80ac))


### Features

* allow using useQuery outside of setup, closes [#1020](https://github.com/vuejs/vue-apollo/issues/1020) ([0cd4f95](https://github.com/vuejs/vue-apollo/commit/0cd4f95f17a67ba2fcd2503524cae2922ca87e8f))
* **composable:** es build ([cfbb9da](https://github.com/vuejs/vue-apollo/commit/cfbb9da5af00336e56a09da73a4760ba0dbf5874))



# [4.0.0-alpha.10](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.9...v4.0.0-alpha.10) (2020-07-27)



# [4.0.0-alpha.9](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.8...v4.0.0-alpha.9) (2020-07-27)


### Bug Fixes

* Be able to overrid variables in mutate ([#946](https://github.com/vuejs/vue-apollo/issues/946)) ([1867e73](https://github.com/vuejs/vue-apollo/commit/1867e73d546a7e7786dcb652de6d62b7aef6e015))
* **ts:** allow undefined for optional variables ([#962](https://github.com/vuejs/vue-apollo/issues/962)) ([7495987](https://github.com/vuejs/vue-apollo/commit/7495987fdb5b7ab6d7ea458cceadb4997ac92e5f))
* Update @vue/composition-api to v0.6.1 ([#1000](https://github.com/vuejs/vue-apollo/issues/1000)) ([e8e8f54](https://github.com/vuejs/vue-apollo/commit/e8e8f542d26aa5945e7c9681ecde655b3ddcf97f))



# [4.0.0-alpha.8](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.7...v4.0.0-alpha.8) (2020-04-02)


### Bug Fixes

* **ts:** Add typings for late variables in useMutation ([#925](https://github.com/vuejs/vue-apollo/issues/925)) ([576b495](https://github.com/vuejs/vue-apollo/commit/576b49543ac9c8c26586daee263cdbdf80dfd34f))
* **ts:** mutate() types ([5aaa47b](https://github.com/vuejs/vue-apollo/commit/5aaa47b672bc0774ba786852c6186cef253b1c73))
* **ts:** useMutation types ([a9d9501](https://github.com/vuejs/vue-apollo/commit/a9d950156d1f8e89cf8ba3532936b6a09e0b776a))



# [4.0.0-alpha.7](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.6...v4.0.0-alpha.7) (2020-02-16)


### Bug Fixes

* use getCurrentResult() ([d64b0c4](https://github.com/vuejs/vue-apollo/commit/d64b0c42818f817836ea68f37da64eb9587f2152))



# [4.0.0-alpha.6](https://github.com/vuejs/vue-apollo/compare/v4.0.0-4.0.0-alpha.6.0...v4.0.0-alpha.6) (2020-01-22)



# [4.0.0-4.0.0-alpha.6.0](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.4...v4.0.0-4.0.0-alpha.6.0) (2020-01-22)


### Bug Fixes

* compare serialized variables to prevent unnecessary fetch ([3a473e2](https://github.com/vuejs/vue-apollo/commit/3a473e264336b0b2d5442ee4efb63aa8513de1c5))
* **ts:** Add full test coverage for TypeScript hook types & fix missing overloads ([#895](https://github.com/vuejs/vue-apollo/issues/895)) ([32d1f75](https://github.com/vuejs/vue-apollo/commit/32d1f7568e1a4b72fbe2de4ada6985c65675a84b))
* **useMutation:** "mutate" optional arguments ([9d64fca](https://github.com/vuejs/vue-apollo/commit/9d64fca7bcf5e3e353cd8c2963c8dd1e332d29c2))
* **useMutation:** useMutation not taking a Ref ([0ad08c7](https://github.com/vuejs/vue-apollo/commit/0ad08c792ea00587bca574909257cd2e7fa88d4c))
* **useSbuscription:** currentOptions undefined error, closes [#903](https://github.com/vuejs/vue-apollo/issues/903) ([fb1565d](https://github.com/vuejs/vue-apollo/commit/fb1565d2071f9e1b9784ee3b55639f44d29947f5))



# [4.0.0-alpha.4](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.3...v4.0.0-alpha.4) (2019-12-17)


### Bug Fixes

* loading tracking not cleanup correctly on component unmount ([dbb1c09](https://github.com/vuejs/vue-apollo/commit/dbb1c094bde2f83c67d534e1f5b9e5410f909bb8))
* **type:** useResult type inferring 'any' ([#872](https://github.com/vuejs/vue-apollo/issues/872)) ([9edcf2f](https://github.com/vuejs/vue-apollo/commit/9edcf2feb89cea00a8860d4a01c341d357d4b2ac))
* use onBeforeUnmount ([9c4b6b0](https://github.com/vuejs/vue-apollo/commit/9c4b6b09b70b31560dcce6f1d77eb927fa9e9781))



# [4.0.0-alpha.3](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2019-12-04)


### Bug Fixes

* enabled option for `useQuery` & `useSubscription` ([947ceb1](https://github.com/vuejs/vue-apollo/commit/947ceb1743e7ef9d5ba1ca0474f56e356b61235d))
* **useQuery:** throttle & debounce not being applied initially ([280301f](https://github.com/vuejs/vue-apollo/commit/280301f4ac540a05d748b1cc1109e5a975f52380))



# [4.0.0-alpha.2](https://github.com/vuejs/vue-apollo/compare/v4.0.0-alpha.1...v4.0.0-alpha.2) (2019-12-04)


### Bug Fixes

* useXXXLoading() oldValue being undefined and triggering watcher ([ebea61e](https://github.com/vuejs/vue-apollo/commit/ebea61eca656a0f6321910577c5d1cf19a297dd8))


### Features

* **useMutation:** overrideOptions ([3921587](https://github.com/vuejs/vue-apollo/commit/39215877e990e9cd50962a63af7615ff6cedbb45))



# [4.0.0-alpha.1](https://github.com/vuejs/vue-apollo/compare/v3.0.1...v4.0.0-alpha.1) (2019-12-02)


### Bug Fixes

* **components:** main files ([f23d37c](https://github.com/vuejs/vue-apollo/commit/f23d37c9f13fdcdb4db2fba0e31a001a7904d9c9))
* deps ([f289394](https://github.com/vuejs/vue-apollo/commit/f289394e9075aa19a3805b22ee3f7f7e391db206))
* enabled ([afbb5bd](https://github.com/vuejs/vue-apollo/commit/afbb5bd3900379d7b8b865eada05aca50b6652d1))
* ts error ([ab71f87](https://github.com/vuejs/vue-apollo/commit/ab71f8742e8e109e01ea169639646e7214dc06dc))
* **ts:** types file name gql.ts to gql.d.ts ([#864](https://github.com/vuejs/vue-apollo/issues/864)) ([bae6f3c](https://github.com/vuejs/vue-apollo/commit/bae6f3c466e6dc7b3e5f65bb9c1eca6b3a1219af))
* unused import ([786dc5b](https://github.com/vuejs/vue-apollo/commit/786dc5bc2549966ff1e10d4c17011105924c0436))
* use const ([114881d](https://github.com/vuejs/vue-apollo/commit/114881dc4a751367e387eca090edc9ac2d1f1383))
* **useMutation:** allow dyanmic GraphQL document ([9a595b4](https://github.com/vuejs/vue-apollo/commit/9a595b4a5f1becde0e4030e5fe772d1b81375bea))
* **useQuery:** do not use finally ([1bf9552](https://github.com/vuejs/vue-apollo/commit/1bf955206ac0553cf25329e0594dff6d3764c3ec))
* **useQuery:** immediate result ([b4df941](https://github.com/vuejs/vue-apollo/commit/b4df941f28d4721ae9d4c0a80c835c1d985543ba))
* **useQuery:** isEnabled ([e930f0c](https://github.com/vuejs/vue-apollo/commit/e930f0cbffc94a63e06e293568d16e14a9972e4f))
* **useQuery:** loading status on error ([93e6c5b](https://github.com/vuejs/vue-apollo/commit/93e6c5b93ac1298ddade8972deb5d96030df2611))
* **useQuery:** resubscribe after error ([8fcf54d](https://github.com/vuejs/vue-apollo/commit/8fcf54d326dce9113231d7ab02d93c2ea1b79a5a))
* **useQuery:** result when error occurs ([d7f14b3](https://github.com/vuejs/vue-apollo/commit/d7f14b348153742a3d944295abdbc61f9d377264))
* **useSubscription:** don't start on server ([4c72ff2](https://github.com/vuejs/vue-apollo/commit/4c72ff24c0caca7380ddfd764191612f65fdf863))
* **useSubscription:** enabled ([52b5188](https://github.com/vuejs/vue-apollo/commit/52b5188dc9a5cc954ce9b33cb92afa8b65f8f9b4))
* **useSubscription:** loading status on error ([a5dee52](https://github.com/vuejs/vue-apollo/commit/a5dee5268f11844f8a1817f9a8f7c210438e4f3c))


### Features

* @vue/apollo-util pkg + error log utils ([f17ae22](https://github.com/vuejs/vue-apollo/commit/f17ae22d3bacae02322731e726e680e497b8cfc1))
* **composition:** debounce + throttle ([30267b2](https://github.com/vuejs/vue-apollo/commit/30267b297e40b1b93b61826c7cfb9698b35e5a9e))
* improved subscribeToMore ([6d5ce42](https://github.com/vuejs/vue-apollo/commit/6d5ce42e0ab5f3f7215146cba7f310e0d4cec62a))
* useLoading ([008e5f3](https://github.com/vuejs/vue-apollo/commit/008e5f3fc8c0de0cde2e62379d564779d27ee82c))
* useMutation ([c8a7eca](https://github.com/vuejs/vue-apollo/commit/c8a7ecaeb450a33578c96b765d83785544af3c12))
* **useMutation:** called ref ([bfb5d08](https://github.com/vuejs/vue-apollo/commit/bfb5d08c694b1a4aa2ad28094cff241cdf7779aa))
* **useMutation:** onDone & onError ([74ffbd0](https://github.com/vuejs/vue-apollo/commit/74ffbd01e62350da5e4e8439cf157e3b471097d2))
* useQuery ([377f421](https://github.com/vuejs/vue-apollo/commit/377f421a26278f7182545c47ef467eae859c7676))
* **useQuery:** fetchMore ([d73eac8](https://github.com/vuejs/vue-apollo/commit/d73eac827bbc142bc84bf804d97305fbd59819ac))
* **useQuery:** networkStatus ([e57eb7d](https://github.com/vuejs/vue-apollo/commit/e57eb7d073fbc4b7aee4d864563f82b1f823bc8c))
* **useQuery:** onResult & onError ([fac6fea](https://github.com/vuejs/vue-apollo/commit/fac6fea2e6186f12de8d3ab889bebb2f3a01f8d7))
* **useQuery:** prefetch option ([151fbd2](https://github.com/vuejs/vue-apollo/commit/151fbd2fc3d2e41a5db04b827ce546bcba7be63d))
* **useQuery:** refetch ([e77518a](https://github.com/vuejs/vue-apollo/commit/e77518adbaf1d4d18238de28d38cdaf79ebb07b6))
* **useQuery:** SSR support ([5d3b7dc](https://github.com/vuejs/vue-apollo/commit/5d3b7dc598c5463e3495b525ddb31aecfb66a2ad))
* useSubscription ([41b256f](https://github.com/vuejs/vue-apollo/commit/41b256ff2d85286728089dc30de5258268578c8e))
* **useSubscription:** onResult, onError ([d4b18db](https://github.com/vuejs/vue-apollo/commit/d4b18db3103c4eff974bd88c976474a8f9f70cdd))
* wip useLoading ([caa9726](https://github.com/vuejs/vue-apollo/commit/caa9726c76a742263a3b095757983f53b208c511))
