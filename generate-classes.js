#!/usr/bin/env node

const GENERATE_CLASSES = 'generate-classes';
const START_SERVER = 'start-server';

const method = process.argv[2];

switch(method) {
    case GENERATE_CLASSES:
        console.log('Generating classes');
        break;
    case START_SERVER:
        console.log('Starting server');
        break;
    default:
        throw new Error('Command not supported: ' + method);
}