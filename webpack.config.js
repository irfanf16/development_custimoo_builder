const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: './src/main.js',
  module: {
    rules: [
      { test: /\.js$/,  exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.vue$/, exclude: /node_modules/, use: 'vue-loader' },
      { test: /\.css$/, exclude: /node_modules/, use: ['vue-style-loader', 'css-loader']},
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new VueLoaderPlugin(),
  ]
};
