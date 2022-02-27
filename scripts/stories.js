const glob = require('glob');
const fs = require('fs');
const path = require('path');

/**
 * Generate stories from *.auml files for all components
 */
module.exports = {
    generate: function () {

        // outPath is where to create the stories folder
        let outPath = "build/static";

        const componentsFolder = 'components';

        // Create the object that will contain all stories
        let stories = {};        

        // Get all stories
        let storyFiles = glob.sync('./!(node_modules)/**/*.auml');

        for (let file of storyFiles) {

            const content = fs.readFileSync(file, 'utf8');
            const filename = path.basename(file, '.auml');

            // We need to separate component stories and global stories
            if (isWithinFolder(file, componentsFolder)) {

                // Component story
                const componentName = getComponentName(file);

                if(componentName === null)
                {
                    console.error(`Couldn't find the component linked to the story '${file}', the component's manifest might be missing or, if the story is a global story, it shouldn't be in the 'components' folder`)
                    continue;
                }

                // Add it to the other stories of the component
                if(!stories[componentName])
                    stories[componentName] = {};

                stories[componentName][filename] = content;
            }
            else 
            {
                // Global story
                const content = fs.readFileSync(file, 'utf8');

                // Add it to the other global stories
                if(!stories["_global"])
                    stories["_global"] = {};

                stories["_global"][filename] = content;
            }
        }

        // Write the stories object to a place accessible at runtime
        fs.mkdirSync(outPath, { recursive: true });
        fs.writeFileSync(path.join(outPath, "stories.json"), JSON.stringify(stories));
    },
}

function isWithinFolder(filepath, folder) {
    return filepath.includes('/' + folder + '/');
}

function getComponentName(filepath, depth=0) {

    if(depth > 20)
    {
        // If after 20 recursion we couldn't find the manifest, there is a problem
        return null;
    }

    // goes up until we find a component's manifest
    let parentFolder = path.parse(filepath).dir;

    if(parentFolder === "components")
    {
        // If we reached the components folder and we couldn't find a manifest, there is a problem
        return null;
    }

    let manifests = glob.sync('*.manifest.json', { cwd: parentFolder });

    if(manifests.length > 0)
    {
        // we found the manifest, we can now know the component's name
        return path.basename(manifests[0], ".manifest.json");
    }
    else
    {
        return getComponentName(parentFolder, depth + 1);
    }
}
