/**
 *
 * Webpack config for CHOI-TRIE library
 *
 * Author : jbear; JI-WOONG CHOI
 * Contact : http://jbear.co
 * Copyright @ jbear
 *
**/
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

export default () => (
{
    entry: './dist/choi-trie.js',
    output: {
        path: __dirname,
        filename: 'choi-trie-0.2.8.min.js',
	libraryTarget: 'window',
	globalObject: 'this',
	library: 'ChoiTrie'
    },
	optimization: {
		minimizer: [
			new UglifyJsPlugin({ 
			cache: true,
			uglifyOptions: {
				mangle: {
					keep_fnames:true	
				},
				compress: {
					keep_fnames:true,
					drop_console:true
				}	
			}	
			} )
		]
	},
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
}
);
