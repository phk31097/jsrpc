export interface RpcServiceMapping {}

export class RpcClientFactory {
    public getClient<T extends RpcServiceMapping>(): T {
        return new Proxy({}, {
            get(_1, serviceName){
                return new Proxy({}, {
                    get(_2, methodName) {
                        return (...args: any[]) => {
                            console.log(serviceName)
                            console.log(methodName);
                            console.log(args);
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
            fetch(`http://localhost:3000/${serviceName}%${methodName}?${args.map((value, index) => `p${index}=${value}`).join('&')}`)
                .then(response => response.json())
                .then(data => resolve(data['response']))
                .catch(e => reject(e));
        });
    }
}