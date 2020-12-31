const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const mode = argv.mode ?? "development";
  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "minesweeperjs-ui.js",
      library: 'minesweeperjs-ui',
      libraryTarget: 'umd'
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }, {
        test: /\.ico$/,
        loader: "url-loader"
      }],
    },
    plugins: [
      new MiniCssExtractPlugin({filename: "minesweeperjs-ui.css"})
    ],
    optimization: {
      minimize:  mode==="production",
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin()
      ]
    }
  }
};