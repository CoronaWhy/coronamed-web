const path = require('path');
const glob = require('glob');

process.env.VUE_APP_VERSION = require('./package.json').version;
process.env.VUE_APP_MODULES = glob.sync(path.join('src', '_*', 'index.js')).map(filePath => {
	const location = path.dirname(filePath);
	const dirName = location.split(path.sep).pop();

	return dirName;
}).join(',');

process.env.VUE_APP_DATA_FIELS = glob.sync(path.join('src', 'data', '**', '*.*')).map(filePath => {
	return filePath.substring(4); // rm src/
}).join('|_|');

module.exports = {
	devServer: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000/',
				changeOrigin: true
			}
		}
	},
	css: {
		loaderOptions: {
			sass: {
				data: `@import "~@/scss/resources.scss";`
			}
		}
	},
	chainWebpack: (config) => {
		// Custom CSV loader

		const csvRule = config.module.rule('csv');

		csvRule
			.test(/\.(csv|tsv)$/)
			.use('csv-loader')
			.loader('csv-loader')
			.end();
	}
};
