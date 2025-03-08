import type { UseResultReturn } from '../../src'
import type {
  ExampleQueryVariables,
  MultiKeyExampleQuery,
  SingleKeyExampleQuery,
} from '../fixtures/graphql-example-types'
import { useQuery, useResult } from '../../src'
import {
  ExampleDocument,
} from '../fixtures/graphql-example-types'
import { assertExactType } from './assertions'

const singleKeyQuery = useQuery<SingleKeyExampleQuery, ExampleQueryVariables>(ExampleDocument, {
  id: 'j37rV7',
})
const { result: singleKeyResult } = singleKeyQuery

const multiKeyQuery = useQuery<MultiKeyExampleQuery, ExampleQueryVariables>(ExampleDocument, {
  id: 'j37rV7',
})
const { result: multiKeyResult } = multiKeyQuery

// =============================================================================
// With just a document, no types, and a single key
// - the result should extract the single key type
// - the default return value should be `undefined`
// =============================================================================
{
  const useResult_JustDocument_SingleKey = useResult(singleKeyResult)

  assertExactType<
    typeof useResult_JustDocument_SingleKey,
    UseResultReturn<SingleKeyExampleQuery['example'] | undefined>
  >(useResult_JustDocument_SingleKey)

  if (useResult_JustDocument_SingleKey.value) {
    useResult_JustDocument_SingleKey.value.__typename
  }
}

// =============================================================================
// With just a document, no types, and multiple keys
// - the result should be the full result type
// - the default return value should be `undefined`
// =============================================================================
{
  const useResult_JustDocument_MultiKey = useResult(multiKeyResult)

  assertExactType<
    typeof useResult_JustDocument_MultiKey,
    UseResultReturn<MultiKeyExampleQuery | undefined>
  >(useResult_JustDocument_MultiKey)

  if (useResult_JustDocument_MultiKey.value) {
    useResult_JustDocument_MultiKey.value.example?.__typename
    useResult_JustDocument_MultiKey.value.otherExample?.__typename
  }
}

// =============================================================================
// With just a document, no types, and a single key
// - the result should extract the single key type
// - the result should be either the default value or the expected extracted single key type
// =============================================================================
{
  const useResult_WithDefaultValue_SingleKey = useResult(singleKeyResult, 'secret' as const)

  assertExactType<
    typeof useResult_WithDefaultValue_SingleKey,
    UseResultReturn<SingleKeyExampleQuery['example'] | 'secret'>
  >(useResult_WithDefaultValue_SingleKey)

  if (typeof useResult_WithDefaultValue_SingleKey.value === 'string') {
    const result = useResult_WithDefaultValue_SingleKey.value
    assertExactType<typeof result, 'secret'>(result)
    useResult_WithDefaultValue_SingleKey.value
  }
  else {
    useResult_WithDefaultValue_SingleKey.value?.__typename
  }
}

// =============================================================================
// With just a document, no types, and multiple keys
// - the result should be the full result type
// - the result should be either the default value or full expected key type
// =============================================================================
{
  const useResult_WithDefaultValue_MultiKey = useResult(multiKeyResult, 'secret' as const)

  assertExactType<
    typeof useResult_WithDefaultValue_MultiKey,
    UseResultReturn<MultiKeyExampleQuery | 'secret'>
  >(useResult_WithDefaultValue_MultiKey)

  if (typeof useResult_WithDefaultValue_MultiKey.value === 'string') {
    const result = useResult_WithDefaultValue_MultiKey.value
    assertExactType<typeof result, 'secret'>(result)
    useResult_WithDefaultValue_MultiKey.value
  }
  else {
    useResult_WithDefaultValue_MultiKey.value?.example?.__typename
    useResult_WithDefaultValue_MultiKey.value?.otherExample?.__typename
  }
}

// =============================================================================
// With a document, default value, no types, and a pick function
// - the result should be either the default value or the pick function result
// =============================================================================
{
  const useResult_WithPickFunction = useResult(
    multiKeyResult,
    [] as const,
    data => data.otherExample.__typename,
  )

  assertExactType<
    typeof useResult_WithPickFunction,
    UseResultReturn<'OtherExample' | []>
  >(useResult_WithPickFunction)

  if (typeof useResult_WithPickFunction.value === 'string') {
    useResult_WithPickFunction.value.toLowerCase()
  }
  else if (useResult_WithPickFunction.value) {
    useResult_WithPickFunction.value.some(() => undefined)
  }
}

// =============================================================================
// With a document, undefined default value, no types, and a pick function
// - the result should be either undefined or the pick function result
// =============================================================================
// TODO: This test cannot work without strict: true in tsconfig, but many things
// are currently broken in strict.
// {
//   const useResult_WithPickFunction_UndefinedDefault = useResult(
//     multiKeyResult,
//     undefined,
//     data => data.otherExample?.__typename
//   );

//   assertExactType<
//     typeof useResult_WithPickFunction_UndefinedDefault,
//     UseResultReturn<"OtherExample" | undefined>
//   >(useResult_WithPickFunction_UndefinedDefault);

//   if (typeof useResult_WithPickFunction_UndefinedDefault.value === "string") {
//     useResult_WithPickFunction_UndefinedDefault.value.toLowerCase();
//   }
// }
