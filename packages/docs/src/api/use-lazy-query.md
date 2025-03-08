# useLazyQuery

Extends [useQuery](./use-query.md)

## Additional Return

- `load(document?, variables?, options?)`: function to start querying. Returns `Promise<Result>` if it is the first time the query is called, `false` otherwise.

    Example:

    ```js
    const { load, refetch } = useLazyQuery(query, variables, options)

    function fetchOrRefetch() {
      load() || refetch()
    }

    async function waitForLoad() {
      try {
        const result = await load()
        // do something with result
      }
      catch (error) {
        // handle error
      }
    }
    ```
