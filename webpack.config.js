
const path = require('path')
const webpack = require("webpack")
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: __dirname + '/src/export.js',
    output: {
        path: __dirname + '/dist',
        filename: 'frameRpc.js'
    },
    devtool :"eval",
    plugins: [
        new UglifyJSPlugin()
    ]
}
