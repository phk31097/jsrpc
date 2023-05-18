import {RpcServer} from "./rpc-server";

export function rpc(target: Function, ...args: any[]) {
    if (target.prototype !== undefined) {
        RpcServer.services.push(new (target as any)());
    } else {
        throw new Error('Not supported on this element');
    }
}