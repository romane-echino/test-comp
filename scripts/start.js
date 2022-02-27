
const rimraf = require('rimraf');
const dsp = require('./dsp');
const config = require('./config');
const stories = require('./stories');
const build = require('./build');
const server = require('./server');


async function start() {
    console.log('Removing build folder')
    rimraf.sync('build');

    console.log('Generating DSP')
    await dsp.generate("build/static");


    console.log('Generating Config File')
    await config.generate('none');


    console.log('Generating stories')
    await stories.generate();


    console.log('Building runtime bundle')
    await build.bundle();


    console.log('Running server');
    await server.run();
}


start();