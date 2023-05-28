import {RpcResponseVariable, RpcSerializedResponse, RpcSerializer} from "./rpc-serializer";

export class RpcDeserializer {
    public static getObject(response: RpcSerializedResponse): any {
        return this.deserialize(response.response, response)
    }

    protected static deserialize(variable: RpcResponseVariable | RpcResponseVariable[], response: RpcSerializedResponse): any {
        if (Array.isArray(variable)) {
            return variable.map(v => this.deserialize(v, response));
        }
        const result = this.findByKey(variable.$key, response);
        for (const key in result) {
            if (RpcSerializer.isResponseVariable(result[key])) {
                result[key] = this.findByKey(result[key].$key, response);
            }
        }
        return result;
    }

    protected static findByKey(key: string, response: RpcSerializedResponse): any {
        const result = response.objects.find(item => item.key === key);
        if (result) {
            return result.value;
        }
        throw new Error(`Key '${key}' not found`);
    }
}