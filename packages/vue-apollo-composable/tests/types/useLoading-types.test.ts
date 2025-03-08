import type { ComputedRef } from 'vue-demi'
import {
  useGlobalMutationLoading,
  useGlobalQueryLoading,
  useGlobalSubscriptionLoading,
  useMutationLoading,
  useQueryLoading,
  useSubscriptionLoading,
} from '../../src/useLoading'
import { assertExactType } from './assertions'

{
  const useQueryLoadingReturn = useQueryLoading()
  assertExactType<typeof useQueryLoadingReturn, ComputedRef<boolean>>(useQueryLoadingReturn)
}

{
  const useMutationLoadingReturn = useMutationLoading()
  assertExactType<typeof useMutationLoadingReturn, ComputedRef<boolean>>(
    useMutationLoadingReturn,
  )
}

{
  const useSubscriptionLoadingReturn = useSubscriptionLoading()
  assertExactType<typeof useSubscriptionLoadingReturn, ComputedRef<boolean>>(
    useSubscriptionLoadingReturn,
  )
}

{
  const useGlobalQueryLoadingReturn = useGlobalQueryLoading()
  assertExactType<typeof useGlobalQueryLoadingReturn, ComputedRef<boolean>>(
    useGlobalQueryLoadingReturn,
  )
}

{
  const useGlobalMutationLoadingReturn = useGlobalMutationLoading()
  assertExactType<typeof useGlobalMutationLoadingReturn, ComputedRef<boolean>>(
    useGlobalMutationLoadingReturn,
  )
}

{
  const useGlobalSubscriptionLoadingReturn = useGlobalSubscriptionLoading()
  assertExactType<typeof useGlobalSubscriptionLoadingReturn, ComputedRef<boolean>>(
    useGlobalSubscriptionLoadingReturn,
  )
}
