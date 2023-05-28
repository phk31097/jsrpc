import {RpcServiceMapping} from "./rpc-service-mapping";
import {RpcServerConfiguration} from "./rpc-server-configuration";
import {RpcDeserializer} from "./rpc-deserializer";

export class RpcClientFactory {

    constructor(protected config: RpcServerConfiguration) {}

    public getClient<T extends RpcServiceMapping>(): T {
        const factory = this;
        return new Proxy({}, {
            get(_1, serviceName){
                return new Proxy({}, {
                    get(_2, methodName) {
                        return (...args: any[]) => {
                            console.log(serviceName)
                            console.log(methodName);
                            console.log(args);
                            return factory.performRequest(String(serviceName), String(methodName), args);
                        }
                    }
                })
            }
        }) as T;
    }

    protected performRequest(serviceName: string, methodName: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(`Call to ${serviceName}#${methodName}`);
            console.log(`Parameters: ${args}`);
            fetch(`${this.config.host}:${this.config.port}/${serviceName}%${methodName}?${args.map((value, index) => `p${index}=${value}`).join('&')}`)
                .then(response => response.json())
                .then(data => resolve(RpcDeserializer.getObject(data)))
                .catch(e => reject(e));
        });
    }
}