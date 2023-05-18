import {RpcService} from "./rpc-service";

export class RpcRequestMatcher {

    protected readonly METHOD_SEPARATOR = '%';
    protected readonly QUERY_SEPARATOR = '?';
    protected readonly PARAM_SEPARATOR = '&';
    protected readonly PARAM_VALUE_SEPARATOR = '=';

    constructor(protected services: RpcService[]) {}

    public match<T extends RpcService>(url: string): {service: T, method: keyof T, args: any[]} {
        const [serviceString, methodAndParams] = url.substring(1).split(this.METHOD_SEPARATOR);

        if (!methodAndParams) {
            throw new Error('No method specified');
        }

        const [methodString, paramString] = methodAndParams.split(this.QUERY_SEPARATOR);
        const args = paramString ? paramString.split(this.PARAM_SEPARATOR)
            .map(split => split.split(this.PARAM_VALUE_SEPARATOR)[1]) : [];

        const service = this.services.find(service => service.constructor.name === serviceString) as T | undefined;

        if (!service) {
            throw new Error(`No service '${serviceString}' found`);
        }

        if (!(methodString in service)) {
            throw new Error(`No method '${methodString}' found in '${service}'`)
        }

        const method: keyof T = methodString as keyof T;

        return {service, method, args};
    }
}