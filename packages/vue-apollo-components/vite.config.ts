import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/** Matches the package itself and any subpath, so a deep import is not silently bundled. */
function externalize(name: string) {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(?:/|$)`)
}

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.lib.json' }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    sourcemap: true,
    rollupOptions: {
      // Bundling any of these would ship a second copy alongside the consumer's.
      external: [
        externalize('vue'),
        externalize('@vue/reactivity'),
        externalize('@vue/apollo-composable'),
        externalize('@apollo/client'),
        externalize('@wry/equality'),
        externalize('graphql'),
      ],
      // The default export is the plugin, kept for v4's `app.use()` setup step.
      output: { exports: 'named' },
    },
  },
})
