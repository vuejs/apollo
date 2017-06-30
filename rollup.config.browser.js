import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-js-harmony'

export default {
  entry: 'src/index.js',
  dest: 'dist/vue-apollo.min.js',
  format: 'iife',
  exports: 'named',
  moduleName: 'VueApollo',
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
    uglify({}, minify),
  ],
}
