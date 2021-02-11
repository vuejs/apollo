import esbuild from 'esbuild'
import path from 'path'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

(async () => {
  const builds = [
    { format: 'esm', file: 'index.esm.js' },
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
      plugins: [
        nodeExternalsPlugin(),
      ],
    })
  }
})()
