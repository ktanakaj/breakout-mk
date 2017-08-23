/**
 * @file Karma設定スクリプト。
 */
module.exports = function(config) {
	config.set({
		basePath: './public/app/',
		frameworks: ['jasmine'],
		files: [
			'../../test/karma.entry.ts'
		],
		exclude: [],
		preprocessors: {
			'../../test/karma.entry.ts': ['webpack', 'sourcemap']
		},
		reporters: ['progress'],
		port: 9876,
		colors: true,
		logLevel: config.LOG_DEBUG,
		client: {
			captureConsole: true
		},
		autoWatch: false,
		browsers: ['PhantomJS'],
		singleRun: true,
		concurrency: Infinity,
		webpack: Object.assign({
			devtool: 'inline-source-map',
		}, require('./webpack.config')),
	})
}