import DefaultTheme from 'vitepress/theme'
import SponsorButton from './components/sponsor-button.vue'

export default {
  ...DefaultTheme,
  enhanceApp ({ app }) {
    app.component('SponsorButton', SponsorButton)
  },
}
