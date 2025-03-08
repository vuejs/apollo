import type { OperationVariables } from '@apollo/client/core'
import type { VueApolloComponentOptions } from '../options'
import gql from 'graphql-tag'
import { Options, Vue } from 'vue-property-decorator'

@Options({
  apollo: {
    allFilms: {
      query: gql``,
      variables(): OperationVariables {
        return {
          foo: this.foo,
        }
      },
    },
  } as VueApolloComponentOptions<Decorator>,
})
export default class Decorator extends Vue {
  allFilms = []
  foo = 'bar'
}
