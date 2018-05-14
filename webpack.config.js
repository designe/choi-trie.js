/**
 *
 * Webpack config for CHOI-TRIE library
 *
 * Author : jbear; JI-WOONG CHOI
 * Contact : http://jbear.co
 * Copyright @ jbear
 *
**/

module.exports = {
    entry: './choi-trie.js',
    output: {
        path: __dirname,
        filename: 'choi-trie.min.js'
    },
    mode: 'development',
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
};
