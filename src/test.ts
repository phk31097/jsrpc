import {RpcCodeGenerator} from "./build/code-generator";
import {RpcServer} from "./export";

new RpcCodeGenerator({
    baseDirectory: 'test-project/src',
    sharedDirectory: 'shared',
    clientDirectory: 'client',
    serverDirectory: 'server',
}).generate();

new RpcServer({port: 3000}, []).listen();