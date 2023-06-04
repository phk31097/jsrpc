import {RpcServiceMapping} from "./rpc-service-mapping";
import {RpcServerConfiguration} from "./rpc-server-configuration";
import {RpcDeserializer} from "./rpc-deserializer";
import {RpcSerializer} from "./rpc-serializer";

export class RpcClientFactory {

    constructor(protected config: RpcServerConfiguration) {}

    public getClient<T extends RpcServiceMapping,K extends keyof T>(arg0: string) {
        const factory = this;
        const dummyFnForTypeInference = function <K extends keyof T>(serviceName: K): T[K] {
            return new Proxy({}, {
                get(_2, methodName) {
                    return (...args: any[]) => {
                        console.log(serviceName)
                        console.log(methodName);
                        return factory.performRequest(String(serviceName), String(methodName), args);
                    }
                }
            }) as T[K];
        }
        return dummyFnForTypeInference(arg0 as keyof T);
    }

    protected performRequest(serviceName: string, methodName: string, args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(`Call to ${serviceName}#${methodName}`);
            console.log(`Parameters: ${args}`);
            const url = `${this.config.host}:${this.config.port}/${serviceName}%${methodName}`;
            fetch(url, {
                method: 'POST',
                mode: 'same-origin',
                cache: 'no-cache',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(RpcSerializer.getSerializedObject(args))
            })
                .then(response => response.json())
                .then(data => resolve(RpcDeserializer.getObject(data)))
                .catch(e => reject(e));
        });
    }
}