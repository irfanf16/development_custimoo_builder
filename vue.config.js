const path = require("path");

module.exports = {
  configureWebpack: {
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js',
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
