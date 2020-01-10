import gql from "graphql-tag";

export type ID = string;

export type Example = {
  id: ID;
  name?: string;
  colors?: string[];
};

export const ExampleFragmentDoc = gql`
  fragment ExampleFragment on Example {
    name
    colors
  }
`;

export type ExampleFragment = {
  name?: string;
  colors?: string[];
};

export const ExampleDocument = gql`
  query getExample($id: ID!) {
    example(id: $id) {
      id
      ...ExampleFragment
    }
  }

  ${ExampleFragmentDoc}
`;

export type ExampleQuery = {
  example?: {
    __typename?: "Example";
    id?: string;
  } & ExampleFragment;
};

export type ExampleQueryVariables = {
  id: ID;
};

export type ExampleUpdatePayload = {
  errors?: string[];
  example?: Example;
};

export type ExampleUpdateMutation = {
  exampleUpdate?: ExampleUpdatePayload;
};

export type ExampleInput = {
  name?: string;
  colors?: string[];
};

export type ExampleUpdateMutationVariables = {
  id: ID;
  example: ExampleInput;
};

export type ExampleUpdatedSubscription = {
  exampleUpdated: ExampleFragment;
};

export type ExampleUpdatedSubscriptionVariables = {
  id: ID;
};

export type SingleKeyExampleQuery = {
  example?: {
    __typename?: "Example";
  };
};

export type MultiKeyExampleQuery = {
  example?: {
    __typename?: "Example";
  };
  otherExample?: {
    __typename?: "OtherExample";
  };
};
