import {RpcCodeGenerator} from "./code-generator";
import {RpcServer} from "./rpc-server";

new RpcCodeGenerator({
    baseDirectory: 'test-project',
    sharedDirectory: 'shared',
    clientDirectory: 'client',
    serverDirectory: 'server',
}).generate();

new RpcServer({port: 3000}).listen();