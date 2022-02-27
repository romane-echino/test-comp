const path = require('path');

const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * launch webpack with custom config ../config/webpack.config.js to build bundle
 */

module.exports = {
    bundle: async function () {
        let configPath = path.join(__dirname, "./webpack-build.config.js");
        
        console.log('build',configPath);
        try {
            await exec(`webpack --config ${configPath}`);
        }
        catch (err) {
            console.log(err.stdout);
            throw ('ERROR')
        }
    }
}
