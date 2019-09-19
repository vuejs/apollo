export type DeepApplyThisType<T, TThis> = {[K in keyof T]: DeepApplyThisType<T[K], TThis>} & ThisType<TThis>
