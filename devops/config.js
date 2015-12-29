import path, { join as pathJoin } from 'path';
import webpack, { DefinePlugin } from 'webpack';
import packageJson from '../package.json';
import yargs from 'yargs';
import _ from 'lodash';

export const fromRoot = pathJoin.bind(path, path.resolve(__dirname, '../'));

export const PATHS = {
	build: fromRoot('dist')
};

export const ENVIRONMENTS = {
	DEV: 'development',
	PROD: 'production'
};

const ARGV = yargs.argv;

export const IS_DEBUG = !!ARGV.debug;
export const IS_WATCH = !!ARGV.watch;
export const IS_PROD = !!ARGV[ENVIRONMENTS.PROD];
export const IS_DEV = !IS_PROD;

export const BUNDLE_POSTFIX = `${IS_DEV ? 'dev' : 'min'}`;
export const SDK_VERSION = packageJson.version;

export const WEBPACK_CLIENT = (() => {
	let plugins = [
		new webpack.optimize.OccurenceOrderPlugin(),
		new DefinePlugin({
			SDK_VERSION: JSON.stringify(SDK_VERSION),
			IS_DEBUG: IS_DEBUG,
			IS_DEV: IS_DEV,
			IS_PROD: IS_PROD
		})
	];

	if (!IS_DEV) {
		plugins = plugins.concat([
			new webpack.optimize.DedupePlugin(),
			new webpack.optimize.UglifyJsPlugin({ sourceMap: false }),
			new webpack.optimize.AggressiveMergingPlugin()
		]);
	}

	return {
		entry: {
			sdk: fromRoot('index.js')/*,
			crypto: fromRoot('src/crypto/browser.js')*/
		},

		output: {
			path: PATHS.build,
			filename: `virgil-[name].${BUNDLE_POSTFIX}.js`,
			libraryTarget: 'umd'
		},

		target: 'web',

		cache: IS_DEBUG,
		debug: IS_DEBUG,
		useMemoryFs: true,
		progress: true,
		watch: IS_WATCH,

		stats: {
			colors: true,
			reasons: IS_DEBUG
		},

		plugins: plugins,

		devtool: IS_DEBUG ? 'inline-source-map' : false,

		resolve: {
			modulesDirectories: ['node_modules'],
			extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
			alias: {
				'virgil-crypto': './src/crypto/browser.js'
			}
		},

		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules|virgil-emscripten\.js/,
					// use runtime to optimize the code, but it make sense when you have a lot of ES6 files
					loader: 'babel-loader'
				}
			]
		}
	};
})();
