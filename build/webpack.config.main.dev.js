const merge = require("webpack-merge")
const baseConfig = require("./webpack.config.main.base")
const DefinePlugin = require("webpack").DefinePlugin

module.exports = merge(baseConfig, {
  mode: "development",
  devtool: "source-map",

  plugins: [
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      SERVER_BUILD: true,
    }),
  ],
})
