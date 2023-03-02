import esbuild from 'esbuild'
import path from 'path'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

/** @typedef {import('esbuild').BuildOptions} BuildOptions */

/**
 * @typedef Build
 * @prop {BuildOptions['format']} format
 * @prop {string} file
 */

(async () => {
  /** @type {Build[]} */
  const builds = [
    { format: 'esm', file: 'index.mjs' },
    { format: 'cjs', file: 'index.js' },
  ]
  for (const { format, file } of builds) {
    await esbuild.build({
      entryPoints: ['./src/index.ts'],
      bundle: true,
      platform: 'neutral',
      format,
      outfile: path.join('dist', file),
      sourcemap: true,
      target: 'es2018',
      plugins: [
        nodeExternalsPlugin(),
      ],
    })
  }
})()
