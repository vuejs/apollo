# useResult

## Parameters

- `result`: `Ref` holding the result data from an Apollo operation.

- `defaultValue`: (default: `null`) Default value used if the data isn't available.

- `pick`: (default: `null`) Picking function that get the data object as parameter and should return a derived object from it.

## Return

`useResult` return a `Ref` containing the picked data from the result data.
