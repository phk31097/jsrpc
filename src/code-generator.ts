interface RpcCodeGeneratorOptions {
    sharedDirectory: string;
    clientDirectory: string;
    serverDirectory: string;
}

export class RpcCodeGenerator {
    protected constructor(private options?: RpcCodeGeneratorOptions) {}
}