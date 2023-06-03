import {describe, test, expect} from "@jest/globals";
import {RpcSerializer} from "./rpc-serializer";

describe('RPC Serializer', () => {
    test('should serialize a string', () => {
        const result = RpcSerializer.getSerializedObject("Hello World");
        expect(result.objects).toHaveLength(0);
        expect(result.main).toEqual("Hello World");
    });

    test('should serialize a string array', () => {
        const result = RpcSerializer.getSerializedObject(['a', 'b', 'c']);
        expect(result.objects).toHaveLength(0);
        expect(result.main).toEqual(['a', 'b', 'c']);
    });

    test('should serialize an object', () => {
        const obj = {x: 0, y: 15};
        const result = RpcSerializer.getSerializedObject(obj);
        expect(result.objects).toEqual([{key: 'key0', value: {x: 0, y: 15}}]);
        expect(result.main).toEqual({$key: 'key0'});
    });

    test('should serialize an object array', () => {
        const obj = [{x: 0, y: 15}, {x: 15, y: 0}];
        const result = RpcSerializer.getSerializedObject(obj);
        expect(result.objects).toEqual([
            {key: 'key0', value: {x: 0, y: 15}},
            {key: 'key1', value: {x: 15, y: 0}},
        ]);
        expect(result.main).toEqual([
            {$key: 'key0'},
            {$key: 'key1'},
        ]);
    });
});