import DefaultTheme from 'vitepress/theme'
import SponsorButton from './components/SponsorButton.vue'

import './styles/index.pcss'

export default {
  ...DefaultTheme,
  enhanceApp ({ app }) {
    app.component('SponsorButton', SponsorButton)
  },
}
