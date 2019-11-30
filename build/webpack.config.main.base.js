const { resolve } = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: {
    main: ["./app/main/index.js"],
  },

  output: {
    path: resolve("dist/main"),
    filename: "[name].bundle.js",
  },

  target: "node",
  node: false,
  externals: [
    {
      keytar: "commonjs keytar",
    },
    nodeExternals({
      whitelist: [/^(app)/i],
      modulesDir: "node_modules",
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/i,
        use: ["babel-loader"],
        include: [resolve("app/main")],
      },
    ],
  },

  resolve: {
    modules: [resolve("app"), resolve("app/main"), "node_modules"],
    extensions: [".js"],
  },
}
