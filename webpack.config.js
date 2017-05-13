module.exports = {
	entry: './src/app.ts',
	output: {
		path: __dirname +'/js',  
		filename: 'web-sph.js',
		publicPath: '/js/',
		libraryTarget: 'var',
		library: 'WebSPH'
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
	},
	module: {
		loaders: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: 'ts-loader' },
			{ test: /\.(glsl|vs|fs|vert|frag)$/, loader: 'shader-loader' },
		]
	}
}