const fs = require('fs');
const path = require('path');

module.exports = {
    generate: function (clusterURL) {

        let outpath = 'build/static';
        let config = {
            clusterURL: clusterURL
        }

        // Create the out path if it doesn't exist yet
        fs.mkdirSync(outpath, { recursive: true });

        // Write the acl file
        fs.writeFileSync(path.join(outpath, "config.json"), JSON.stringify(config));
    }
}