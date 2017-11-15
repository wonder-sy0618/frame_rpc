
var path = require('path')
var webpack = require("webpack")


const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry:  {
      "frameRpc" : __dirname + "/src/export.js"
    },
    output: {
        path: path.join(__dirname, "/dist/"),
        filename: "[name].js"
    },
    devtool :"source-map",
    plugins: [
      new UglifyJSPlugin()
    ]
}
