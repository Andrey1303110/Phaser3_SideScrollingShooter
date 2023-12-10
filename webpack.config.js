const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const package = require('./package.json');

module.exports = {
  entry: path.resolve(__dirname, './src/scripts/main.js'),

  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    clean: true,
    path: path.resolve(__dirname, './dist'),
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|mp3|wav)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'phaser',
          enforce: true,
          chunks: 'initial',
        },
      },
    },
  },
  
  devServer: {
    static: path.resolve(__dirname, "./dist"),
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets/',
          to: 'assets/',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
      filename: 'index.html',
      title: package.description,
      inject: 'body',
      hot: true,
    }),
  ],

  resolve: {
    extensions: ['.js'],
  },
};
