import {RpcServerConfiguration} from "./rpc-server-configuration";

export interface RpcCodeGeneratorOptions {
    baseDirectory: string;
    sharedDirectory: string;
    clientDirectory: string;
    serverDirectory: string;
    serverFileName: string;
    clientFileName: string;
}

export interface JsrpcConfig {
    server: RpcServerConfiguration;
    code: RpcCodeGeneratorOptions;
}

export class JsrpcConfigValidator {
    public static getConfig(obj?: {[index: string]:any}): JsrpcConfig {
        const config = JsrpcConfigValidator.getDefaultConfig();
        if (!obj) {
            return config;
        }
        JsrpcConfigValidator.assign(obj, config);
        console.log(config);
        return config;
    }

    protected static assign(changes: {[index: string]:any}, template: {[index: string]:any}): void {
        for (const key in changes) {
            if (key in template) {
                if (typeof template[key] === 'object') {
                    if (typeof changes[key] === 'object') {
                        JsrpcConfigValidator.assign(changes[key], template[key]);
                    } else {
                        throw new Error(`Configuration '${key}' must be an object`);
                    }
                } else {
                    template[key] = changes[key];
                }
            } else {
                throw new Error(`Unknown configuration: '${key}'`);
            }
        }
    }

    protected static getDefaultConfig(): JsrpcConfig {
        return {
            server: {
                host: 'http://localhost',
                port: 3000
            },
            code: {
                baseDirectory: 'src',
                sharedDirectory: 'shared',
                clientDirectory: 'client',
                serverDirectory: 'server',
                serverFileName: 'server.jsrpc.ts',
                clientFileName: 'client.jsrpc.ts'
            }
        }
    }
}