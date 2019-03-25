'use strict';

process.env.NODE_ENV = 'development';

const paths = require('./paths');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        'static/js/main.js': [require.resolve('./polyfills'), paths.appIndexJs],
    },
    output: {
        path: paths.appBuild,
        filename: '[name]',
        publicPath: '/',
    },
    // eval-source-map is maybe a little slower than "eval" but you can debug with your source files in the browser
    devtool: 'eval-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx|mjs)$/,
                include: [paths.appSrc],
                loader: require.resolve('babel-loader'),
            },
            {
                test: /\.scss$/,
                include: paths.appAssets,
                use: [
                    MiniCssExtractPlugin.loader, // creates css files from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader', // compiles Sass to CSS
                ],
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            WEBPACK_PUBLIC_URL: "''",
        }),
        new HtmlWebpackPlugin({
            template: paths.appHtml,
            inject: true,
        }),
        new InterpolateHtmlPlugin({
            PUBLIC_URL: '',
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/main.css',
        }),
    ],
    devServer: {
        publicPath: '/',
        watchContentBase: true,
        historyApiFallback: {
            // Paths with dots should still use the history fallback.
            // See https://github.com/facebookincubator/create-react-app/issues/387.
            disableDotRule: true,
        },
    },
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    performance: false,
};
