const merge = require("webpack-merge")
const baseConfig = require("./webpack.config.main.base")
const DefinePlugin = require("webpack").DefinePlugin

module.exports = merge(baseConfig, {
  mode: "production",

  plugins: [
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      SERVER_BUILD: true,
    }),
  ],
})
