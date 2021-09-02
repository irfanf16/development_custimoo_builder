const path = require("path");

module.exports = {
  configureWebpack: {
    output: {
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[hash].js',
    },
    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, 'src/assets'),

      }
    }
  },

}
