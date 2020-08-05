declare module '*.gql' {
  import { DocumentNode } from '@apollo/client'

  const content: DocumentNode
  export default content

}

declare module '*.graphql' {
  import { DocumentNode } from '@apollo/client'

  const content: DocumentNode
  export default content
}
