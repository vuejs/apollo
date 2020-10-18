import type { ComponentInternalInstance } from 'vue-demi'
import type { AppLoadingTracking } from './loadingTracking'

export interface CurrentInstance extends Omit<ComponentInternalInstance, 'root' | '$root'> {
  _apolloAppTracking?: AppLoadingTracking
  $root?: CurrentInstance
  root?: CurrentInstance
  $isServer?: boolean
}
