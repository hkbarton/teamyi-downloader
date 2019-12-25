const { resolve } = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: {
    renderer: ["./app/renderer/index.js"],
  },

  output: {
    path: resolve("dist/renderer"),
    filename: "[name].bundle.js",
  },

  externals: {
    electron: "commonjs electron",
    // node module used in renderer
    fs: "commonjs fs",
    path: "commonjs path",
    dgram: "commonjs dgram",
    buffer: "commonjs buffer",
  },

  performance: {
    maxEntrypointSize: 5000000,
    maxAssetSize: 5000000,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [resolve("app/renderer")],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
            },
          },
          "postcss-loader",
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true,
              paths: ["./node_modules/antd/dist"],
            }
          },
        ],
      },
      {
        test: /\.svg$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-react"],
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
          {
            loader: "react-svg-loader",
            options: { jsx: true },
          },
        ],
      },
    ],
  },

  resolve: {
    modules: [
      resolve("app"),
      resolve("app/renderer"),
      "node_modules",
    ],
    extensions: [".js"],
    symlinks: false,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          ecma: 8,
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          preset: "default",
        },
      }),
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),

    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "app/renderer/index.html",
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
  ]
}
