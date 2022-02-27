const glob = require('glob');
const fs = require('fs');
const path = require('path');

/**
 * generate DSP file from created components following the dsp documentation : https://github.com/AdobeXD/design-system-package-dsp
 * args :
 * - outPath : Where to store the generated dsp package
 * - devMode : if true the dsp is build for a dev buid, if false it is built for production, a dev build contains information only relevant when working on the component
 * - separateFiles : if true the entities are stored in separate files
 */
module.exports = {
    generate: function (outPath, devMode = false, separateFiles = false) {

        // libraryPath is the path to the library folder, example 'src/package', the library folder must contain the "components" folder
        let libraryPath = 'src';

        // packageJsonPath is where the package.json file is stored relative to the present script, default to current working directory (process.cwd) which should work when using it in a package.json script
        let packageJsonPath = process.cwd() + "/package.json";

        const componentsFolder = devMode ? 'example/components' : 'components';

        // Build the dsp
        let dsp = {};
        dsp.dsp_spec_version = "1.0" //TODO is this the version of the spec or of the file ?
        dsp.last_updated = new Date().toISOString();

        dsp.settings = {}

        dsp.settings.languages = [
            {
                "label": "Scenar.io",
                "export_tokens": false,
                "snippet_id": "scenar.io",
                "syntax": "text/xml"
            }
            //TODO do we need other languages ?
        ]

        let packageDef = require(packageJsonPath);

        // From package.json
        dsp.last_updated_by = packageDef.author ? packageDef.author : "unknown";
        dsp.settings.name = packageDef.name;
        dsp.settings.package_version = packageDef.version;

        dsp["ext-com_echino-library"] = packageDef.echino;

        // Get all documentation files in subfolders expect in node_modules
        let docFiles = glob.sync('./!(node_modules)/**/*.md');

        // Add files in root foler, eg. README.md
        docFiles = docFiles.concat(glob.sync('./*.md'));

        let componentDocs = {};

        let docEntities = [];

        for (let file of docFiles) {

            if(path.basename(file) === 'sdk.md')
                continue;

            // Some documentation files are documentation about component and as such are part of the component specification
            if (isWithinFolder(file, componentsFolder)) {
                // Documentation about a component
                const content = fs.readFileSync(file, 'utf8');
                const componentName = path.basename(file, path.extname(file));

                // Store the documentation for later
                componentDocs[componentName] = content;
            }
            else // General documentation will become doc entities in the dsp file
            {
                // General documentation

                let docEntity = buildDocEntity(file, dsp.last_updated_by, dsp.last_updated);
                docEntities.push(docEntity);
            }
        }

        // Components are placed inside the "components" folder
        // Each component has its own folder
        //TODO is it really the most robust way to handle that ?
        //TODO the 'best' way would be to get all export from the index but we can't since the code is not transpiled yet

        let componentsPath = path.join(libraryPath, componentsFolder);
        const componentNames = fs.readdirSync(componentsPath).filter(f => fs.statSync(path.join(componentsPath, f)).isDirectory())

        let componentEntities = [];

        let componentManifests = {};
        for (let componentName of componentNames) {
            let manifestPath = path.join(componentsPath, componentName, `${componentName}.manifest.json`);

            if (fs.existsSync(manifestPath)) {
                // There is a manifest for this component
                componentManifests[componentName] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            }
        }

        // We have to do that in 2 loops because of inheritance
        for(var componentName in componentManifests)
        {
            //ignore hidden components
            if(componentManifests[componentName].hidden)
                continue;

            let componentEntity = buildComponentEntity(componentName, componentManifests, componentDocs[componentName], dsp.last_updated_by, dsp.last_updated, devMode);
            componentEntities.push(componentEntity);
        }

        // Create the out path if it doesn't exist yet
        fs.mkdirSync(outPath, { recursive: true });

        // Create separate files if needed and add imports to the main file
        if(separateFiles)
        {
            // Create the data folder
            fs.mkdirSync(path.join(outPath, "data"), { recursive: true });

            // Prepare component and doc files
            let componentsFile = {
                "dsp_spec_version": dsp.dsp_spec_version,
                "last_updated_by": dsp.last_updated_by,
                "last_updated": dsp.last_updated,
                "entities": componentEntities
            }

            let docsFile = {
                "dsp_spec_version": dsp.dsp_spec_version,
                "last_updated_by": dsp.last_updated_by,
                "last_updated": dsp.last_updated,
                "entities": docEntities
            }

            // Create files
            fs.writeFileSync(path.join(outPath, "data", "components.json"), JSON.stringify(componentsFile));
            fs.writeFileSync(path.join(outPath, "data", "docs.json"), JSON.stringify(docsFile));

            // Add imports
            dsp.import = [];
            dsp.import.push({
                "src": "data/components.json"
            });
            dsp.import.push({
                "src": "data/docs.json"
            })
        }
        else
        {
            // Otherwise, entities are stored directly in the main file
            dsp.entities = [];
            dsp.entities = dsp.entities.concat(componentEntities, docEntities);
        }

        // Write the dsp.json file
        fs.writeFileSync(path.join(outPath, "dsp.json"), JSON.stringify(dsp));
    },
}

function isWithinFolder(filepath, folder) {
    return filepath.includes('/' + folder + '/');
}

function buildDocEntity(filePath, last_updated_by, last_updated) {
    let docEntity = {};
    docEntity.class = "doc";
    docEntity.type = "page";

    // Generate a random string for the id
    const { v4: uuidv4 } = require('uuid');
    docEntity.id = uuidv4();

    // Use the .md file to retrieve some information
    docEntity.name = path.basename(filePath, path.extname(filePath)); // file name
    docEntity.description = fs.readFileSync(filePath, 'utf8'); // file content

    docEntity.last_updated = last_updated; //TODO do we really need the last updated at/by for this file specifically ?
    docEntity.last_updated_by = last_updated_by;

    // VS code xd extension requires the tag element
    docEntity.tags = [];

    return docEntity;
}

function buildComponentEntity(componentId, manifests, documentation, last_updated_by, last_updated, devMode) {
    let componentEntity = {}
    componentEntity.class = "component"
    componentEntity.type = "page"

    componentEntity.id = componentId // must match export name

    let echinoInfo = {};

    let currentManifest = manifests[componentId];

    if (currentManifest) {
        // From {componentName}.manifest.json
        componentEntity.name = currentManifest.name // user-friendly name,
        echinoInfo.menuPath = currentManifest.menu; // Determine the path to access the component within the menu 
        echinoInfo.icon = currentManifest.icon;
        echinoInfo.bindable = currentManifest.bindable;

        //TODO would be great to obtain props directly from the code
        // - if ts : using the interface
        // - if js : using prop-types if present

        echinoInfo.props = setProps(currentManifest.props, devMode);

        // Add inherited props
        if(currentManifest.inherit)
        {
            for(var parent of currentManifest.inherit)
            {
                if(!manifests[parent] || ! manifests[parent].props)
                    continue

                let parentPros = setProps(manifests[parent].props, devMode);
                echinoInfo.props = echinoInfo.props.concat(parentPros);
            }
        }
        
        echinoInfo.childrenProps = setProps(currentManifest.childrenProps, devMode);
            
        echinoInfo.children = currentManifest.children;

        componentEntity.snippets = {};
        componentEntity.snippets.trigger = componentId.toLowerCase();

        if (currentManifest.snippets) {
            componentEntity.snippets.languages = currentManifest.snippets;
        }
        else
        {
            componentEntity.snippets.languages = {}
        }
    }
    else {
        // default to id
        componentEntity.name = componentId;
    }

    componentEntity["ext-com_echino-entity"] = echinoInfo;

    // From an eventual {componentName}.md file
    componentEntity.description = documentation

    componentEntity.last_updated = last_updated; //TODO do we really need the last updated at/by for this file specifically ?
    componentEntity.last_updated_by = last_updated_by;

    // VS code xd extension requires the tag and the related_entity_ids element
    componentEntity.tags = [];
    componentEntity.related_entity_ids = [];

    return componentEntity;
}

function setProps(manifestProps, devMode)
{
    if(!manifestProps)
        return;

    // Some values need to be handle differently
    for (let prop of manifestProps) {
        // In devMode, default values are replaced by dev values if they exist
        if (devMode && prop.devValue) {
            prop.default = prop.devValue;
        }

        if (prop.devValue) {
            // But in production, dev values are erased
            delete prop.devValue;
        }
    }

    return manifestProps;
}