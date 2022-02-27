const path = require('path');
const glob = require('glob');
const fse = require('fs-extra');

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require("./webpack-server.config.js");


/**
 * Run webpack dev server
 */
module.exports = {
    run: function () {
        //copy all files and folder from app (runtime app) to build directory
        let source = path.join(__dirname, "../app");
        console.log('source',source)
        let files = glob.sync('**/*', { cwd: source });
        files.map(file => fse.copySync(path.resolve(source, file), path.resolve('build', file)));
        

        const compiler = Webpack(webpackConfig);
        const devServerOptions = { ...webpackConfig.devServer, open: true };
        const server = new WebpackDevServer(devServerOptions, compiler);

        const runServer = async () => {
            console.log('Starting server...');
            await server.start();
        };

        runServer();
    }
}
