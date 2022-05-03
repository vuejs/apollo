import './styles/index.pcss'

import DefaultTheme from 'vitepress/dist/client/theme-default'
import SponsorButton from './components/SponsorButton.vue'

export default {
  ...DefaultTheme,
  enhanceApp ({ app }) {
    app.component('SponsorButton', SponsorButton)
  },
}
