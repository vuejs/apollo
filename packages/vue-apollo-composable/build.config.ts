import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index' },
    { input: 'src/compat/index', name: 'compat' },
  ],
  declaration: true,
  sourcemap: true,
  rollup: {
    emitCJS: true,
  },
})
