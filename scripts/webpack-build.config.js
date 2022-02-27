/**
 * generates:
 *  - build/bundle.js
 * 
 */
 const webpack = require("webpack");
 const path = require('path');

 module.exports = {
   mode:'production',
   target: 'node',
   entry: {
     main: './src/index'
   },
   output: {
     libraryTarget: "commonjs",
     filename: "bundle.js",
     path: path.resolve('build/static')
   },
   externals: [
     {
       react: 'react',
       'react-router': 'react-router'
     },
     /^@echino\/echino\.ui\..*/
   ],
   module: {
     rules: [
       {
         test: /\.[tj]sx?$/,
         exclude: path.resolve(__dirname, "node_modules"),
         use: {
           loader: "babel-loader"
         }
       },
       {
         test: /\.s[ac]ss$/i,
         use: [
           // Creates `style` nodes from JS strings
           'style-loader',
           // Translates CSS into CommonJS
           'css-loader',
           // Compiles Sass to CSS
           'sass-loader',
         ],
       }
     ]
   },
   resolve: {
     extensions: ['.js', '.jsx', '.ts', '.tsx'],
   }
 };
 