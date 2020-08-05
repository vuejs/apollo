<script>
import { gql } from '@apollo/client'

export default {
  data () {
    return {
      hey: 'hey'
    }
  },

  apollo: {
    foobar: {
      query: gql``,
      variables () {
        return {
          var1: this.hey,
        }
      },
      subscribeToMore: [
        {
          document: gql``,
          variables () {
            return {
              var1: this.hey
            }
          }
        }
      ],
    },
  },
}
</script>
