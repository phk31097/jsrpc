#!/usr/bin/env node
const { JsrpcProject } = require('./dist/build/jsrpc-project');
const fs = require('fs');

const GENERATE_CLASSES = 'generate-classes';
const START_SERVER = 'start-server';
const INIT = 'init';

const method = process.argv[2];

if (method === INIT) {
    console.log('Initializing new JSRPC project ...');
    if (!fs.existsSync(JsrpcProject.PROJECT_FILE_NAME)) {
        fs.writeFileSync(JsrpcProject.PROJECT_FILE_NAME, '{}');
        console.log(`Created new project file: '${JsrpcProject.PROJECT_FILE_NAME}'`);
    }
    const project = JsrpcProject.init(false);
    const basePath = project.pathInBasePath();
    const clientPath = project.pathInBasePath(project.configuration.code.clientDirectory);
    const serverPath = project.pathInBasePath(project.configuration.code.serverDirectory);
    const sharedPath = project.pathInBasePath(project.configuration.code.sharedDirectory);

    [basePath, clientPath, serverPath, sharedPath].forEach(path => {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            console.log(`Created '${path}'`);
        }
    });

    return;
}

const project = JsrpcProject.init();

switch(method) {
    case GENERATE_CLASSES:
        console.log('Generating classes');
        project.generateCode();
        break;
    case START_SERVER:
        console.log('Starting server, trying the following file: ' + project.configuration.code.serverFileName);
        project.startServer();
        break;
    case INIT:
        console.log('Project set up successfully');
        break;
    default:
        throw new Error('Command not supported: ' + method);
}