import { babel } from '@rollup/plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'

const pkg = require('./package.json')
const version = process.env.VERSION || pkg.version
const extensions = ['.js', '.jsx', '.ts', '.tsx']
const name = pkg.name
const banner =
  '/*!\n' +
  ` * ${name} v${version}\n` +
  ` * (c) 2014-${new Date().getFullYear()} zengfukun <zengfukun@foxmail.com>",\n` +
  ' */'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      name,
      format: 'cjs',
      banner
    },
    {
      file: 'dist/index.esm.js',
      name,
      format: 'es',
      banner
      // When export and export default are not used at the same time, set legacy to true.
      // legacy: true,
    },
    {
      file: 'dist/index.umd.js',
      name,
      format: 'umd',
      banner
    }
  ],
  external: ['vue', 'vue-property-decorator'],
  plugins: [
    replace({
      preventAssignment: true,
      __DEV__: `process.env.NODE_ENV !== 'production'`
    }),
    typescript({
      sourceMap: true
    }),
    resolve({
      extensions
    }),
    commonjs({ extensions: ['.js', '.ts'] }),
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      extensions
    })
  ]
}
