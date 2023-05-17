import {RpcClient, RpcService} from "./rpc-service";

interface RpcServiceClass<T extends RpcService> {
    new (name: string): T;
}

export class RpcClientFactory {
    getClient<T extends RpcService>(service: RpcServiceClass<T>): RpcClient<T> {
        return {} as RpcClient<T>;
    }
}

interface MyTestService extends RpcService {
    helloWorld(str: string): string;
}

class MyTestServiceClass implements MyTestService {
    helloWorld(str: string): string {
        return str;
    }
}

const client = new RpcClientFactory().getClient(MyTestServiceClass);
client.helloWorld('asdf');