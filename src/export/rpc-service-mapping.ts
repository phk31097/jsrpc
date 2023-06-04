import {RpcService} from "./rpc-service";
import {RpcClient} from "./rpc-client";

export interface RpcServiceMapping {
    [index: string]: RpcClient<RpcService>
}