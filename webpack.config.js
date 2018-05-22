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
        filename: 'choi-trie-0.2.8.min.js'
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
};
