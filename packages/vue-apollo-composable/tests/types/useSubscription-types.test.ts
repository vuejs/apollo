import { OperationVariables } from '@apollo/client/core'
import { useSubscription } from '../../src'
import {
  ExampleDocument,
  ExampleUpdatedSubscription,
  ExampleUpdatedSubscriptionVariables,
  ExampleTypedSubscriptionDocument,
} from '../fixtures/graphql-example-types'
import { assertExactType } from './assertions'

// =============================================================================
// With no types:
// - TResult should be `any`
// - TVariables should be `undefined`
// =============================================================================
{
  const useSubscription_NoTypes = useSubscription(ExampleDocument)

  // Result type should match the passed in subscription type
  const useSubscription_NoTypesResult = useSubscription_NoTypes.result.value
  useSubscription_NoTypesResult.type.is.any

  // Variables type should be `undefined`
  const useSubscription_NoTypesVariables = useSubscription_NoTypes.variables.value
  assertExactType<typeof useSubscription_NoTypesVariables, undefined>(
    useSubscription_NoTypesVariables,
  )

  // Result data type should be any
  useSubscription_NoTypes.onResult(result => result?.data.type.is.any)
}

// =============================================================================
// With only subscription type:
// - TResult should be the subscription type
// - TVariables should be `undefined`
// =============================================================================
{
  const useSubscription_OnlySubscriptionType = useSubscription<ExampleUpdatedSubscription>(
    ExampleDocument,
  )

  // Result type should match the passed in subscription type
  const useSubscription_OnlySubscriptionTypeResult =
    useSubscription_OnlySubscriptionType.result.value
  assertExactType<typeof useSubscription_OnlySubscriptionTypeResult, ExampleUpdatedSubscription | null | undefined>(
    useSubscription_OnlySubscriptionTypeResult,
  )

  // Variables type should be `undefined`
  const useSubscription_OnlySubscriptionTypeVariables =
    useSubscription_OnlySubscriptionType.variables.value
  assertExactType<typeof useSubscription_OnlySubscriptionTypeVariables, undefined>(
    useSubscription_OnlySubscriptionTypeVariables,
  )

  // Result data type should be the passed in result
  useSubscription_OnlySubscriptionType.onResult(result => result?.data?.exampleUpdated.name)
}

// =============================================================================
// With only Subscription type but passing in variables:
// - TResult should be the Subscription type
// - TVariables should be OperationVariables
// =============================================================================
{
  const useSubscription_WithVars = useSubscription<ExampleUpdatedSubscription>(ExampleDocument, {
    id: 'asdf',
  })

  // Result type should match the passed in subscription type
  const useSubscription_WithVarsResult = useSubscription_WithVars.result.value
  assertExactType<typeof useSubscription_WithVarsResult, ExampleUpdatedSubscription | null | undefined>(
    useSubscription_WithVarsResult,
  )

  // Variables type should match the passed in variables type
  const useSubscription_WithVarsVariables = useSubscription_WithVars.variables.value
  assertExactType<typeof useSubscription_WithVarsVariables, OperationVariables | undefined>(
    useSubscription_WithVarsVariables,
  )

  // Result data type should be the passed in result
  useSubscription_WithVars.onResult(result => result?.data?.exampleUpdated.name)
}

// =============================================================================
// With all types
// - TResult should be the subscription type
// - TVariables should be the variables type
// =============================================================================
{
  const useSubscription_AllTyped = useSubscription<
  ExampleUpdatedSubscription,
  ExampleUpdatedSubscriptionVariables
  >(ExampleDocument, { id: 'k3x47b' })

  // Result type should match the passed in subscription type
  const useSubscription_AllTypedResult = useSubscription_AllTyped.result.value
  assertExactType<typeof useSubscription_AllTypedResult, ExampleUpdatedSubscription | null | undefined>(
    useSubscription_AllTypedResult,
  )

  // Variables type should match the passed in variables type
  const useSubscription_AllTypedVariables = useSubscription_AllTyped.variables.value
  assertExactType<typeof useSubscription_AllTypedVariables, ExampleUpdatedSubscriptionVariables | undefined>(
    useSubscription_AllTypedVariables,
  )

  // Result data type should be the passed in result
  useSubscription_AllTyped.onResult(result => result?.data?.exampleUpdated.name)
}

// =============================================================================
// With all types and without variables because the query has optional variables
// - TResult should be the subscription type
// - TVariables should be the variables type
// =============================================================================
{
  const useSubscription_AllTyped = useSubscription<
  ExampleUpdatedSubscription,
  ExampleUpdatedSubscriptionVariables
  >(ExampleDocument)

  // Result type should match the passed in subscription type
  const useSubscription_AllTypedResult = useSubscription_AllTyped.result.value
  assertExactType<typeof useSubscription_AllTypedResult, ExampleUpdatedSubscription | null | undefined>(
    useSubscription_AllTypedResult,
  )

  // Variables type should match the passed in variables type
  const useSubscription_AllTypedVariables = useSubscription_AllTyped.variables.value
  assertExactType<typeof useSubscription_AllTypedVariables, ExampleUpdatedSubscriptionVariables | undefined>(
    useSubscription_AllTypedVariables,
  )

  // Result data type should be the passed in result
  useSubscription_AllTyped.onResult(result => result?.data?.exampleUpdated.name)
}

// =============================================================================
// With subscription types, and no variables
// - TResult should be the subscription type
// - TVariables should be `undefined`
// =============================================================================
{
  const useSubscription_OnlySubscriptionType_NoVarsWithOptions = useSubscription<
  ExampleUpdatedSubscription
  >(ExampleDocument, undefined, {
    clientId: '89E3Yh',
  })

  // Result type should match the passed in subscription type
  const useSubscription_OnlySubscriptionType_NoVarsWithOptionsResult =
    useSubscription_OnlySubscriptionType_NoVarsWithOptions.result.value
  assertExactType<
    typeof useSubscription_OnlySubscriptionType_NoVarsWithOptionsResult,
  ExampleUpdatedSubscription | null | undefined
  >(useSubscription_OnlySubscriptionType_NoVarsWithOptionsResult)

  // Variables type should be `undefined`
  const useSubscription_OnlySubscriptionType_NoVarsWithOptionsVariables =
    useSubscription_OnlySubscriptionType_NoVarsWithOptions.variables.value
  assertExactType<
    typeof useSubscription_OnlySubscriptionType_NoVarsWithOptionsVariables,
  null | undefined
  >(useSubscription_OnlySubscriptionType_NoVarsWithOptionsVariables)

  // Result data type should be the passed in result
  useSubscription_OnlySubscriptionType_NoVarsWithOptions.onResult(
    result => result?.data?.exampleUpdated.name,
  )
}

// =============================================================================
// With subscription types, variables, and options
// - TResult should be the subscription type
// - TVariables should be the variables type
// =============================================================================
{
  const useSubscription_WithOptions = useSubscription<
  ExampleUpdatedSubscription,
  ExampleUpdatedSubscriptionVariables
  >(
    ExampleDocument,
    { id: '4E79Lq' },
    {
      clientId: '8nf38r',
      debounce: 1500,
      enabled: true,
      fetchPolicy: 'cache-first',
      throttle: 1500,
    },
  )

  const useSubscription_WithOptionsResult = useSubscription_WithOptions.result.value
  assertExactType<typeof useSubscription_WithOptionsResult, ExampleUpdatedSubscription | null | undefined>(
    useSubscription_WithOptionsResult,
  )

  const useSubscription_WithOptionsVariables = useSubscription_WithOptions.variables.value
  assertExactType<typeof useSubscription_WithOptionsVariables, ExampleUpdatedSubscriptionVariables | undefined>(
    useSubscription_WithOptionsVariables,
  )

  // Result data type should be the passed in result
  useSubscription_WithOptions.onResult(result => result?.data?.exampleUpdated.name)
}

// =============================================================================
// With a TypedQueryDocument:
// - TResult should be the subscription type
// - TVariables should be the variables type
// =============================================================================
{
  const useSubscription_AllTyped = useSubscription(ExampleTypedSubscriptionDocument, { id: 'k3x47b' })

  // Result type should match the passed in subscription type
  const useSubscription_AllTypedResult = useSubscription_AllTyped.result.value
  assertExactType<typeof useSubscription_AllTypedResult, ExampleUpdatedSubscription | null | undefined>(
    useSubscription_AllTypedResult,
  )

  // Variables type should match the passed in variables type
  const useSubscription_AllTypedVariables = useSubscription_AllTyped.variables.value
  assertExactType<typeof useSubscription_AllTypedVariables, ExampleUpdatedSubscriptionVariables | undefined>(
    useSubscription_AllTypedVariables,
  )

  // Result data type should be the passed in result
  useSubscription_AllTyped.onResult(result => result?.data?.exampleUpdated.name)
}

// // ====== Expected failures, uncomment to test ======

// // @ts-expect-error - should require variables to be OperationType
// const useSubscription_NoTypesBadVariables = useSubscription(ExampleDocument, 'failme')

// // @ts-expect-error - should require variables to be OperationType
// const useSubscriptionBadSubscriptionVariables = useSubscription<ExampleUpdatedSubscription>(ExampleDocument, 'failme')

// // @ts-expect-error - should require variables to be OperationType
// const useSubscriptionBadVariables = useSubscription<ExampleUpdatedSubscription, ExampleUpdatedSubscriptionVariables>(ExampleDocument, 'failme')

// // @ts-expect-error - this should expect two arguments
// const useSubscription_AllTypedMissingVariables = useSubscription<ExampleUpdatedSubscription, ExampleUpdatedSubscriptionVariables>(ExampleDocument)
