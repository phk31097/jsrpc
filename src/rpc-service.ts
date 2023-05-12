export interface RpcService {}

export type RpcClient<Type> = {
    [Properties in keyof Type]: Promise<Type>
};