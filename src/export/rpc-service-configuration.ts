import {RpcService} from "./rpc-service";

export interface RpcServiceConfiguration<T extends RpcService> {
    listensTo: string[];
    service: T;
}