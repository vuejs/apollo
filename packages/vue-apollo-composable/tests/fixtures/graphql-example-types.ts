import gql from 'graphql-tag'
import { TypedDocumentNode } from '@apollo/client/core/index.js'

export type ID = string

export interface Example {
  id: ID
  name?: string
  colors?: string[]
}

export const ExampleFragmentDoc = gql`
  fragment ExampleFragment on Example {
    name
    colors
  }
`

export interface ExampleFragment {
  name?: string
  colors?: string[]
}

export const ExampleDocument = gql`
  query getExample($id: ID!) {
    example(id: $id) {
      id
      ...ExampleFragment
    }
  }

  ${ExampleFragmentDoc}
`

export interface ExampleQuery {
  example?: {
    __typename?: 'Example'
    id?: string
  } & ExampleFragment
}

export interface ExampleQueryVariables {
  id: ID
}

export interface ExampleUpdatePayload {
  errors?: string[]
  example?: Example
}

export interface ExampleUpdateMutation {
  exampleUpdate?: ExampleUpdatePayload
}

export interface ExampleInput {
  name?: string
  colors?: string[]
}

export interface ExampleUpdateMutationVariables {
  id: ID
  example: ExampleInput
}

export interface ExampleUpdatedSubscription {
  exampleUpdated: ExampleFragment
}

export interface ExampleUpdatedSubscriptionVariables {
  id: ID
}

export interface SingleKeyExampleQuery {
  __typename?: 'Root'
  example?: {
    __typename?: 'Example'
  }
}

export interface MultiKeyExampleQuery {
  __typename?: 'Root'
  example?: {
    __typename?: 'Example'
  }
  otherExample?: {
    __typename?: 'OtherExample'
  }
}

export const ExampleTypedQueryDocument: TypedDocumentNode<ExampleQuery, ExampleQueryVariables> = ExampleDocument

export const ExampleTypedMutationDocument: TypedDocumentNode<ExampleUpdateMutation, ExampleUpdateMutationVariables> = ExampleDocument

export const ExampleTypedSubscriptionDocument: TypedDocumentNode<ExampleUpdatedSubscription, ExampleUpdatedSubscriptionVariables> = ExampleDocument
