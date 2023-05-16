# useLazyQuery

Extends [useQuery](./use-query.md)

## Additional Return

- `load(document?, variables?, options?)`: function to start querying. Returns `true` if it is the first time the query is called, `false` otherwise.

    Example:

    ```js
    const { load, refetch } = useLazyQuery(query, variables, options)

    function fetchMyData () {
      load() || refetch()
    }
    ```
