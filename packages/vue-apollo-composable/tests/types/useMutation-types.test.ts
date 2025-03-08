import type { FetchResult } from '@apollo/client/core'
import type { MutateFunction } from '../../src'
import type {
  ExampleUpdateMutation,
  ExampleUpdateMutationVariables,
  ExampleUpdatePayload,
} from '../fixtures/graphql-example-types'
import { useMutation } from '../../src'
import {
  ExampleDocument,
  ExampleTypedMutationDocument,
} from '../fixtures/graphql-example-types'
import { assertExactType } from './assertions'

// =============================================================================
// With no types:
// - TResult should be `any`
// =============================================================================
{
  const useMutationNoTypes = useMutation(ExampleDocument)

  useMutationNoTypes.onDone((param) => {
    assertExactType<typeof param, FetchResult<any> | undefined>(param)
    param?.data.dataType.is.anything
  })

  useMutationNoTypes.mutate()
}
{
  const useMutationNoTypes = useMutation(ExampleDocument)

  useMutationNoTypes.onDone((param) => {
    assertExactType<typeof param, FetchResult<any> | undefined>(param)
    param?.data.dataType.is.anything
  })

  useMutationNoTypes.mutate({
    input: {
      foo: 'bar',
    },
  })
}
{
  const useMutationNoTypes = useMutation(ExampleDocument)

  useMutationNoTypes.onDone((param) => {
    assertExactType<typeof param, FetchResult<any> | undefined>(param)
    param?.data.dataType.is.anything
  })

  useMutationNoTypes.mutate({
    input: {
      foo: 'bar',
    },
  }, {
    fetchPolicy: 'no-cache',
  })
}
{
  const useMutationNoTypes = useMutation(ExampleDocument)

  useMutationNoTypes.onDone((param) => {
    assertExactType<typeof param, FetchResult<any> | undefined>(param)
    param?.data.dataType.is.anything
  })

  useMutationNoTypes.mutate(null, {
    fetchPolicy: 'no-cache',
  })
}
{
  const useMutationNoTypes = useMutation(ExampleDocument)

  useMutationNoTypes.onDone((param) => {
    assertExactType<typeof param, FetchResult<any> | undefined>(param)
    param?.data.dataType.is.anything
  })

  useMutationNoTypes.mutate(undefined, {})
}

// =============================================================================
// With just the mutation:
// - TResult should be the mutation type
// - TVariables should be `undefined`
// =============================================================================
{
  const useMutationOnlyMutationType = useMutation<ExampleUpdateMutation>(ExampleDocument)

  useMutationOnlyMutationType.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })

  useMutationOnlyMutationType.mutate(undefined, {})
}

// =============================================================================
// With just the mutation and with options:
// - TResult should be the mutation type
// - TVariables should be `any`
// =============================================================================
{
  const useMutationOnlyMutationTypeWithOptions = useMutation<ExampleUpdateMutation>(
    ExampleDocument,
    {
      fetchPolicy: 'no-cache',
    },
  )

  useMutationOnlyMutationTypeWithOptions.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })

  useMutationOnlyMutationTypeWithOptions.mutate(undefined, {})
}

// =============================================================================
// With all things typed
// - TResult should be the mutation type
// - TVariables should be the variables type
// =============================================================================
{
  const useMutationAllTyped = useMutation<ExampleUpdateMutation, ExampleUpdateMutationVariables>(
    ExampleDocument,
    { variables: { id: '1', example: { name: 'new' } } },
  )

  useMutationAllTyped.mutate({ id: '2', example: { name: 'remix' } }, {})

  useMutationAllTyped.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })
}

// =============================================================================
// With all types and without variables because the query has optional variables
// - TResult should be the mutation type
// - TVariables should be the variables type
// =============================================================================
{
  const useMutationAllTyped = useMutation<ExampleUpdateMutation, ExampleUpdateMutationVariables>(ExampleDocument)

  useMutationAllTyped.mutate({ id: '2', example: { name: 'remix' } }, {})

  useMutationAllTyped.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })
}

{
  const useMutationAllTyped = useMutation<ExampleUpdateMutation, ExampleUpdateMutationVariables>(ExampleDocument)

  useMutationAllTyped.mutate({ id: '2', example: { name: 'remix' } }, {})

  useMutationAllTyped.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })
}

// =============================================================================
// With all things typed and with options and variables
// - TResult should be the mutation type
// - TVariables should be the variables type
// - mutate should have an optional variables parameter
// =============================================================================
{
  const withVariablesInOptionsVariables = { id: '1', example: { name: 'new' } }
  const withVariablesInOptions = useMutation<ExampleUpdateMutation, ExampleUpdateMutationVariables>(
    ExampleDocument,
    {
      awaitRefetchQueries: true,
      clientId: '37Hn7m',
      context: { any: true },
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
      optimisticResponse: (vars: ExampleUpdateMutationVariables) => ({
        exampleUpdate: { example: { id: '' } },
      }),
      refetchQueries: ['firstQuery', 'secondQuery'],
      update: (proxy, mutationResult: FetchResult<ExampleUpdateMutation>) => {
        mutationResult.data?.exampleUpdate
      },
      updateQueries: {
        query: (result, options) => {
          options.mutationResult.data?.exampleUpdate
          return {}
        },
      },
      variables: withVariablesInOptionsVariables,
    },
  )

  assertExactType<typeof withVariablesInOptions.mutate, MutateFunction<ExampleUpdateMutation, ExampleUpdateMutationVariables>>(
    withVariablesInOptions.mutate,
  )

  withVariablesInOptions.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })
}

// =============================================================================
// With all things typed and without options
// - TResult should be the mutation type
// - TVariables should be the variables type
// - mutate should have a required variables parameter
// =============================================================================
{
  const withNoOptions = useMutation<ExampleUpdateMutation, ExampleUpdateMutationVariables>(
    ExampleDocument,
  )

  assertExactType<typeof withNoOptions.mutate, MutateFunction<ExampleUpdateMutation, ExampleUpdateMutationVariables>>(
    withNoOptions.mutate,
  )

  withNoOptions.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })
}

// =============================================================================
// With all things typed and with options, but without variables
// - TResult should be the mutation type
// - TVariables should be the variables type
// - mutate should have a required variables parameter
// =============================================================================
{
  const withNoVariablesInOptions = useMutation<ExampleUpdateMutation, ExampleUpdateMutationVariables>(
    ExampleDocument,
    {
      awaitRefetchQueries: true,
      clientId: '37Hn7m',
      context: { any: true },
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
      optimisticResponse: (vars: ExampleUpdateMutationVariables) => ({
        exampleUpdate: { example: { id: '' } },
      }),
      refetchQueries: ['firstQuery', 'secondQuery'],
      update: (proxy, mutationResult: FetchResult<ExampleUpdateMutation>) => {
        mutationResult.data?.exampleUpdate
      },
      updateQueries: {
        query: (result, options) => {
          options.mutationResult.data?.exampleUpdate
          return {}
        },
      },
    },
  )

  assertExactType<typeof withNoVariablesInOptions.mutate, MutateFunction<ExampleUpdateMutation, ExampleUpdateMutationVariables>>(
    withNoVariablesInOptions.mutate,
  )

  withNoVariablesInOptions.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })
}

// =============================================================================
// With a TypedQueryDocument:
// - TResult should be the mutation type
// - TVariables should be the variables type
// =============================================================================
{
  const useMutationAllTyped = useMutation(
    ExampleTypedMutationDocument,
    { variables: { id: '1', example: { name: 'new' } } },
  )

  useMutationAllTyped.mutate({ id: '2', example: { name: 'remix' } }, {})

  useMutationAllTyped.onDone((param) => {
    assertExactType<typeof param, FetchResult<ExampleUpdateMutation> | undefined>(param)
    assertExactType<
      NonNullable<NonNullable<typeof param>['data']>['exampleUpdate'],
    ExampleUpdatePayload | null | undefined
    >(
      param?.data?.exampleUpdate,
    )
  })
}

// ====== Expected failures, uncomment to test ======

// // @ts-expect-error
// // With everything typed:
// // - TResult should be the mutation type
// // - TVariables should be *strongly typed*
// const expectedFailureWrongVars
//   = useMutation<ExampleUpdateMutation, ExampleUpdateMutationVariables>(ExampleDocument, {
//     variables: {
//       invalidKey: 'wrong'
//     }
//   })
