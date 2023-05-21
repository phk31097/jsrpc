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
                    const serviceName = service.name.replace('Client', ''); // FIXME
                    alert(`Call to ${serviceName}#${key}`);
                    console.log(`Call to ${serviceName}#${key}`);
                    console.log(`Parameters: ${args}`);
                    fetch(`http://localhost:3000/${serviceName}%${key}?${args.map((value, index) => `p${index}=${value}`).join('&')}`)
                        .then(response => response.json())
                        .then(data => resolve(data))
                        .catch(e => reject(e));
                });
            }
        }
        return instance as RpcClient<T>;
    }
}