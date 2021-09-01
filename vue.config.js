module.exports = {
  configureWebpack: {
    output: {
      filename: 'js/[name].[contenthash].js',
      chunkFilename: 'js/[name].[contenthash].js',
    }
  }
}
