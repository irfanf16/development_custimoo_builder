const path = require("path");

module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },
  lintOnSave: false,
  configureWebpack: {
    output: {
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[hash].js',
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
