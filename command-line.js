#!/usr/bin/env node
const { RpcCodeGenerator } = require('./node_modules/@philippkoch/jsrpc/dist/code-generator');
const { RpcServer } = require('./node_modules/@philippkoch/jsrpc/rpc-server');


const GENERATE_CLASSES = 'generate-classes';
const START_SERVER = 'start-server';

const method = process.argv[2];

switch(method) {
    case GENERATE_CLASSES:
        console.log('Generating classes');
        const generator = new RpcCodeGenerator({
            baseDirectory: 'src',
            sharedDirectory: 'shared',
            clientDirectory: 'client',
            serverDirectory: 'server',
        });
        generator.generate();
        break;
    case START_SERVER:
        console.log('Starting server');
        new RpcServer({port: 3000}).listen();
        break;
    default:
        throw new Error('Command not supported: ' + method);
}