const path = require("path");

module.exports = {
  configureWebpack: {
    output: {
      filename: 'js/[name].[chunkhash].js',
      chunkFilename: 'js/[name].[chunkhash].js',
    },
    resolve: {
      extensions: ['*', '.js', '.vue', '.json'],
      alias: {
        '@assets': path.resolve(__dirname, 'src/assets'),

      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        // modify the options...

        return options
      })
  }
}
