import {RpcService} from "./rpc-service";

export type RpcClient<T extends RpcService> = {
    [K in keyof T]: T[K] extends (...args: infer P) => infer R
        ? (...args: P) => Promise<R>
        : never;
};