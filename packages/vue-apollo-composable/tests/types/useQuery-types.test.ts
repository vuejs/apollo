import { OperationVariables } from "@apollo/client/core";
import { useQuery } from "../../src";
import {
  ExampleDocument,
  ExampleQuery,
  ExampleQueryVariables
} from "../fixtures/graphql-example-types";
import { assertExactType } from "./assertions";

// =============================================================================
// With no types:
// - TResult should be `any`
// - TVariables should be `undefined`
// =============================================================================
{
  const useQueryNoTypes = useQuery(ExampleDocument);

  const useQueryNoTypesResult = useQueryNoTypes.result.value;
  useQueryNoTypesResult.type.is.any;

  const useQueryNoTypesVariables = useQueryNoTypes.variables.value;
  assertExactType<typeof useQueryNoTypesVariables, undefined>(useQueryNoTypesVariables);
}

// =============================================================================
// With only query type:
// - TResult should be the query type
// - TVariables should be `undefined`
// =============================================================================
{
  const useQueryOnlyQueryType = useQuery<ExampleQuery>(ExampleDocument);

  const useQueryOnlyQueryTypeResult = useQueryOnlyQueryType.result.value;
  assertExactType<typeof useQueryOnlyQueryTypeResult, ExampleQuery>(useQueryOnlyQueryTypeResult);

  const useQueryOnlyQueryTypeVariables = useQueryOnlyQueryType.variables.value;
  assertExactType<typeof useQueryOnlyQueryTypeVariables, undefined>(useQueryOnlyQueryTypeVariables);
}

// =============================================================================
// With only query type but passing in variables:
// - TResult should be the query type
// - TVariables should be OperationVariables
// =============================================================================
{
  const useQueryWithVars = useQuery<ExampleQuery>(ExampleDocument, { id: "asdf" });

  const useQueryWithVarsResult = useQueryWithVars.result.value;
  assertExactType<typeof useQueryWithVarsResult, ExampleQuery>(useQueryWithVarsResult);

  const useQueryWithVarsVariables = useQueryWithVars.variables.value;
  assertExactType<typeof useQueryWithVarsVariables, OperationVariables>(useQueryWithVarsVariables);
}

// =============================================================================
// With all types
// - TResult should be the query type
// - TVariables should be the variables type
// =============================================================================
{
  const useQueryAllTyped = useQuery<ExampleQuery, ExampleQueryVariables>(ExampleDocument, {
    id: "k3x47b"
  });

  const useQueryAllTypedResult = useQueryAllTyped.result.value;
  assertExactType<typeof useQueryAllTypedResult, ExampleQuery>(useQueryAllTypedResult);

  const useQueryAllTypedVariables = useQueryAllTyped.variables.value;
  assertExactType<typeof useQueryAllTypedVariables, ExampleQueryVariables>(
    useQueryAllTypedVariables
  );
}

// =============================================================================
// With all types and without variables because the query has optional variables
// - TResult should be the query type
// - TVariables should be the variables type
// =============================================================================
{
  const useQueryAllTyped = useQuery<ExampleQuery, ExampleQueryVariables>(ExampleDocument);

  const useQueryAllTypedResult = useQueryAllTyped.result.value;
  assertExactType<typeof useQueryAllTypedResult, ExampleQuery>(useQueryAllTypedResult);

  const useQueryAllTypedVariables = useQueryAllTyped.variables.value;
  assertExactType<typeof useQueryAllTypedVariables, ExampleQueryVariables>(
    useQueryAllTypedVariables
  );
}

// =============================================================================
// With query types, and no variables
// - TResult should be the query type
// - TVariables should be `undefined`
// =============================================================================
{
  const useQueryOnlyQueryTypeNoVarsWithOptions = useQuery<ExampleQuery>(
    ExampleDocument,
    undefined,
    {
      clientId: "89E3Yh"
    }
  );

  const useQueryOnlyQueryTypeNoVarsWithOptionsResult =
    useQueryOnlyQueryTypeNoVarsWithOptions.result.value;
  assertExactType<typeof useQueryOnlyQueryTypeNoVarsWithOptionsResult, ExampleQuery>(
    useQueryOnlyQueryTypeNoVarsWithOptionsResult
  );

  const useQueryOnlyQueryTypeNoVarsWithOptionsVariables =
    useQueryOnlyQueryTypeNoVarsWithOptions.variables.value;
  assertExactType<typeof useQueryOnlyQueryTypeNoVarsWithOptionsVariables, undefined>(
    useQueryOnlyQueryTypeNoVarsWithOptionsVariables
  );
}

// =============================================================================
// With query types, variables, and options
// - TResult should be the query type
// - TVariables should be the variables type
// =============================================================================
{
  const useQueryWithOptions = useQuery<ExampleQuery, ExampleQueryVariables>(
    ExampleDocument,
    { id: "4E79Lq" },
    {
      clientId: "any",
      context: "any",
      debounce: 500,
      enabled: true,
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      fetchResults: true,
      metadata: "any",
      notifyOnNetworkStatusChange: true,
      pollInterval: 500,
      prefetch: true,
      returnPartialData: true,
      throttle: 1000
    }
  );

  const useQueryWithOptionsResult = useQueryWithOptions.result.value;
  assertExactType<typeof useQueryWithOptionsResult, ExampleQuery>(useQueryWithOptionsResult);

  const useQueryWithOptionsVariables = useQueryWithOptions.variables.value;
  assertExactType<typeof useQueryWithOptionsVariables, ExampleQueryVariables>(
    useQueryWithOptionsVariables
  );
}

// ====== Expected failures, uncomment to test ======

// // @ts-expect-error - should require variables to be OperationType
// const useQueryNoTypesBadVariables = useQuery(ExampleDocument, 'failme')

// // @ts-expect-error - should require variables to be OperationType
// const useQueryBadQueryVariables = useQuery<ExampleQuery>(ExampleDocument, 'failme')

// // @ts-expect-error - should require variables to be OperationType
// const useQueryBadVariables = useQuery<ExampleQuery, ExampleQueryVariables>(ExampleDocument, 'failme')

// // @ts-expect-error - this should expect two arguments
// const useQueryAllTypedMissingVariables = useQuery<ExampleQuery, ExampleQueryVariables>(ExampleDocument)
