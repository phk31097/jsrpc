import {RpcClient, RpcService} from "./rpc-service";

interface RpcServiceClass<T extends RpcService> {
    new (): T;
}

export class RpcClientFactory {
    getClient<T extends RpcService>(service: RpcServiceClass<T>): RpcClient<T> {
        const instance = new service();
        const prototype = Object.getPrototypeOf(instance);
        for (const key of Object.getOwnPropertyNames(prototype).filter((key) => typeof prototype[key] === 'function')) {
            (instance as any)[key] = (...args: any[]) => {
                return new Promise((resolve, reject) => {
                    alert(`Call to ${service.name}#${key}`);
                    console.log(`Call to ${service.name}#${key}`);
                    console.log(`Parameters: ${args}`);
                    fetch(`http://localhost:3000/${service.name}%${key}?${args.map((value, index) => `p${index}=${value}`).join('&')}`)
                        .catch(e => reject(e))
                        .then(response => resolve(response));
                });
            }
        }
        return instance as RpcClient<T>;
    }
}