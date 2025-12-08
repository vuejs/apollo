import type { EnhanceAppContext } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import Theme from 'vitepress/theme'
import SponsorButton from './components/SponsorButton.vue'

import '@shikijs/vitepress-twoslash/style.css'
import './styles/index.css'

export default {
  extends: Theme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue)
    app.component('SponsorButton', SponsorButton)
  },
}
