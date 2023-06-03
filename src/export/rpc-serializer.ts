export type RpcResponseType = string | number | boolean | RpcResponseVariable;

export interface RpcResponseObject {
    key: string;
    value: {[index: string]: RpcResponseType | RpcResponseType[]}
}

export interface RpcResponseVariable {
    $key: string;
}

export interface RpcSerializedObject {
    main: any;
    objects: RpcResponseObject[];
}

export class RpcSerializer {
    protected counter = 0;

    public static getSerializedObject(obj: any): RpcSerializedObject {
        const responseObject: RpcSerializedObject = {
            main: null,
            objects: [],
        };

        const serializer = new RpcSerializer();

        responseObject.main = serializer.serialize(obj, responseObject);
        responseObject.objects.forEach(o => {delete o.value.$key});

        return responseObject;
    }

    protected serialize(obj: any, response: RpcSerializedObject): RpcResponseType | RpcResponseType[] {
        if (RpcSerializer.isResponseVariable(obj)) {
            return {$key: obj.$key};
        }
        if (RpcSerializer.isObject(obj)) {
            obj.$key = `key${this.counter++}`;
            const serializedObject: {[index: string]: RpcResponseType | RpcResponseType[]} = {};
            for (const key in obj) {
                serializedObject[key] = this.serialize(obj[key], response);
            }
            const objectKey = this.findObject(serializedObject, response);
            if (objectKey) {
                return {$key: objectKey.key};
            } else {
                return RpcSerializer.registerObject(serializedObject, response, obj.$key);
            }
        } else if (Array.isArray(obj)) {
            return obj.map(item => this.serialize(item, response) as RpcResponseType);
        }
        return obj;
    }

    protected findObject(obj: {[index: string]: any}, response: RpcSerializedObject): RpcResponseObject | undefined {
        return response.objects.find(responseObject => RpcSerializer.objectEquals(obj, responseObject.value));
    }

    public static objectEquals(lhs: any, rhs: any): boolean {
        if (typeof lhs !== typeof rhs) {
            return false;
        }
        if (lhs === rhs) {
            return true;
        }

        if (Array.isArray(lhs) && Array.isArray(rhs)) {
            if (lhs.length !== rhs.length) {
                return false;
            }
            for (let i = 0; i < lhs.length; i++) {
                if (!RpcSerializer.objectEquals(lhs[i], rhs[i])) {
                    return false;
                }
            }
            return true;
        }

        if (!this.isObject(lhs) || !this.isObject(rhs)) {
            return false;
        }

        const lhsKeys = Object.keys(lhs);
        const rhsKeys = Object.keys(rhs);

        if (lhsKeys.length !== rhsKeys.length) {
            return false;
        }

        for (let key of lhsKeys) {
            if (!(key in rhs)) {
                return false;
            }
            if (!RpcSerializer.objectEquals(lhs[key], rhs[key])) {
                return false;
            }
        }

        return true;
    }

    protected static registerObject(obj: {[index: string]: RpcResponseType | RpcResponseType[]},
                                    response: RpcSerializedObject,
                                    key: string): RpcResponseVariable {
        response.objects.push({key, value: obj});
        return {$key: key};
    }

    protected static isObject(obj: any): boolean {
        return typeof obj === 'object' && !Array.isArray(obj);
    }

    public static isResponseVariable(object: any): object is RpcResponseVariable {
        return typeof object === 'object' && '$key' in object;
    }
}