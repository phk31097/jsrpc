import {RpcCodeGenerator} from "./build/code-generator";
import {JsrpcConfigValidator} from "./export/jsrpc-config";

new RpcCodeGenerator(JsrpcConfigValidator.getConfig({
    code: {
        baseDirectory: 'test-project/src',
    }
})).generate();

// new RpcServer({port: 3000}).listen();