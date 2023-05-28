#!/usr/bin/env node
const { JsrpcProject } = require('./dist/build/jsrpc-project');

const GENERATE_CLASSES = 'generate-classes';
const START_SERVER = 'start-server';

const method = process.argv[2];
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
    default:
        throw new Error('Command not supported: ' + method);
}