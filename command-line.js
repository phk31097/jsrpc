#!/usr/bin/env node
const { RpcCodeGenerator } = require('./dist/build/code-generator');

const GENERATE_CLASSES = 'generate-classes';
const START_SERVER = 'start-server';

const method = process.argv[2];

switch(method) {
    case GENERATE_CLASSES:
        console.log('Generating classes');
        const generator = new RpcCodeGenerator({
            baseDirectory: 'test-project/src',
            sharedDirectory: 'shared',
            clientDirectory: 'client',
            serverDirectory: 'server',
        });
        generator.generate();
        break;
    case START_SERVER:
        console.log('Starting server, trying the following file: ' + process.argv[3]);
        require(process.argv[3]);
        break;
    default:
        throw new Error('Command not supported: ' + method);
}