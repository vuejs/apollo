<script>
import gql from 'graphql-tag'

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
