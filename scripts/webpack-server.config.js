/**
 * generates:
 *  - build/bundle.js
 * 
 */

 const path = require('path');
 
 module.exports = {
   mode: 'development',
   target: 'web',
   entry: path.resolve('src/index.ts'),
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
           loader: "babel-loader",
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
       },
       {
         test: /\.svg/,
         type: 'asset/inline'
       },
     ]
   },
   devServer: {
     static: {
       directory: path.join(process.cwd(), 'build')
     },
     hot: false,
     port: 9000
   },
   resolve: {
     extensions: ['.js', '.jsx', '.ts', '.tsx'],
   }
 };
 
 