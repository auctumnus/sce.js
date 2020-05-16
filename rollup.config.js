import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import pkg from './package.json'

export default [
	// browser-friendly UMD build
	{
		input: 'src/main.js',
		output: {
			name: pkg.name,
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			resolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
	},
	{
		input: 'src/main.js',
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
]