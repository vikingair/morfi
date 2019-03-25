'use strict';

const paths = require('./paths');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const chalk = require('chalk');

if (process.env.NODE_ENV !== 'production') throw new Error('only for production!');

console.log(chalk.blue.bold('\nBuilding the app:\n'));

module.exports = {
    entry: [require.resolve('./polyfills'), paths.appIndexJs],
    output: {
        path: paths.appBuild,
        filename: 'static/js/[name].[chunkhash:8].js',
        publicPath: '/',
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [paths.appSrc],
                loader: require.resolve('babel-loader'),
                options: {
                    compact: true,
                },
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
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: { ecma: 8 },
                    compress: { ecma: 5, warnings: false, comparisons: false, inline: 2 },
                    mangle: { safari10: true },
                    output: { ecma: 5, comments: false, ascii_only: true },
                },
                parallel: true,
                cache: true,
                sourceMap: false,
            }),
            new OptimizeCSSAssetsPlugin({}),
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            WEBPACK_PUBLIC_URL: "'/morfi'",
        }),
        new HtmlWebpackPlugin({
            template: paths.appHtml,
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new InterpolateHtmlPlugin({
            PUBLIC_URL: '/morfi',
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[chunkhash:8].css',
        }),
    ],
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    performance: false,
};
