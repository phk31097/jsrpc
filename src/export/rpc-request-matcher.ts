import {RpcService} from "./rpc-service";
import {RpcServiceConfiguration} from "./rpc-service-configuration";
import {RpcSerializedObject} from "./rpc-serializer";
import {RpcDeserializer} from "./rpc-deserializer";

export class RpcRequestMatcher {

    protected readonly METHOD_SEPARATOR = '%';

    constructor(protected services: RpcServiceConfiguration<any>[]) {}

    public match<T extends RpcService>(url: string, body: RpcSerializedObject): {service: T, method: keyof T, args: any[]} {
        const [serviceString, methodString] = url.substring(1).split(this.METHOD_SEPARATOR);

        if (!methodString) {
            throw new Error('No method specified');
        }

        const serviceConfiguration = this.services.find(service => service.listensTo.includes(serviceString)) as RpcServiceConfiguration<T> | undefined;

        if (!serviceConfiguration) {
            throw new Error(`No service '${serviceString}' found`);
        }

        if (!(methodString in serviceConfiguration.service)) {
            throw new Error(`No method '${methodString}' found in '${serviceConfiguration}'`)
        }

        const method: keyof T = methodString as keyof T;

        return {service: serviceConfiguration.service, method, args: RpcDeserializer.getObject(body)};
    }
}