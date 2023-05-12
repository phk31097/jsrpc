import {RpcClient, RpcService} from "./rpc-service";

export class RpcClientFactory {
    getClient<T>(service: RpcService): RpcClient<T> {
        return {} as RpcClient<T>;
    }
}