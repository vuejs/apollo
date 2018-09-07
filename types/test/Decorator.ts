import { Component, Vue } from 'vue-property-decorator'

@Component({
  apollo: {
    allFilms: '',
  },
})
export default class Decorator extends Vue {
  allFilms = []
}
