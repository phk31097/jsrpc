import {RpcCodeGenerator} from "./code-generator";

new RpcCodeGenerator({
    baseDirectory: 'src',
    sharedDirectory: 'shared',
    clientDirectory: 'client',
    serverDirectory: 'server',
}).generate();