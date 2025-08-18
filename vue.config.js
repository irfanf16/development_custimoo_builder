const path = require("path");

module.exports = {
  publicPath: "/",
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true,
    },
  },
  lintOnSave: false,
  configureWebpack: {
    output: {
      filename: "js/[name].[hash].js",
      chunkFilename: "js/[name].[hash].js",
    },
    resolve: {
      extensions: ["*", ".js", ".vue", ".json"],
      alias: {
        "@assets": path.resolve(__dirname, "src/assets"),
      },
    },
  },
  devServer: {
    watchOptions: {
      poll: true,
      ignored: /node_modules/,
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => options);
    config.output.chunkFilename("[name].[hash].js");
    config.resolve.alias.set("@assets", path.resolve(__dirname, "src/assets"));
  },
};
