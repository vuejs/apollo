import type { EnhanceAppContext } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import Theme from 'vitepress/theme'
import { h } from 'vue'
import ApiPreference from './components/ApiPreference.vue'
import SponsorButton from './components/SponsorButton.vue'

import '@shikijs/vitepress-twoslash/style.css'
import './styles/index.css'

export default {
  extends: Theme,
  Layout: () => h(Theme.Layout, null, {
    'sidebar-nav-before': () => h(ApiPreference),
  }),
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue)
    app.component('SponsorButton', SponsorButton)
  },
}
