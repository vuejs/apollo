import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/vue-apollo.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'vue-apollo',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}
