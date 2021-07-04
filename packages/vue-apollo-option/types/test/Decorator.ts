import { Options, Vue } from 'vue-property-decorator'
import gql from 'graphql-tag'
import { OperationVariables } from '@apollo/client/core'
import { VueApolloComponentOptions } from '../options'

@Options({
  apollo: {
    allFilms: {
      query: gql``,
      variables (): OperationVariables {
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
