import { Ref } from "@vue/composition-api";
import {
  useGlobalMutationLoading,
  useGlobalQueryLoading,
  useGlobalSubscriptionLoading,
  useMutationLoading,
  useQueryLoading,
  useSubscriptionLoading
} from "../../src/useLoading";
import { assertExactType } from "./assertions";

{
  const useQueryLoadingReturn = useQueryLoading();
  assertExactType<typeof useQueryLoadingReturn, Readonly<Ref<boolean>>>(useQueryLoadingReturn);
}

{
  const useMutationLoadingReturn = useMutationLoading();
  assertExactType<typeof useMutationLoadingReturn, Readonly<Ref<boolean>>>(
    useMutationLoadingReturn
  );
}

{
  const useSubscriptionLoadingReturn = useSubscriptionLoading();
  assertExactType<typeof useSubscriptionLoadingReturn, Readonly<Ref<boolean>>>(
    useSubscriptionLoadingReturn
  );
}

{
  const useGlobalQueryLoadingReturn = useGlobalQueryLoading();
  assertExactType<typeof useGlobalQueryLoadingReturn, Readonly<Ref<boolean>>>(
    useGlobalQueryLoadingReturn
  );
}

{
  const useGlobalMutationLoadingReturn = useGlobalMutationLoading();
  assertExactType<typeof useGlobalMutationLoadingReturn, Readonly<Ref<boolean>>>(
    useGlobalMutationLoadingReturn
  );
}

{
  const useGlobalSubscriptionLoadingReturn = useGlobalSubscriptionLoading();
  assertExactType<typeof useGlobalSubscriptionLoadingReturn, Readonly<Ref<boolean>>>(
    useGlobalSubscriptionLoadingReturn
  );
}
