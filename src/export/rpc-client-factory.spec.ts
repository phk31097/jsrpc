import {beforeEach, describe, it} from "@jest/globals";
import {RpcClientFactory} from "./rpc-client-factory";
import {RpcServiceMapping} from "./rpc-service-mapping";
import {RpcClient} from "./rpc-client";
import {RpcSerializer} from "./rpc-serializer";

describe('RPC Client Factory', () => {

    let emptyRequest = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            main: [],
            objects: [],
        })
    };

    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({
                main: {$key: 'key0'},
                objects: [
                    {
                        key: 'key0',
                        value: 'Hello World'
                    }
                ]
            }),
        })
    );

    beforeEach(() => {
        fetch.mockClear();
    });

    it('should send RPC requests', done => {
        const factory = new RpcClientFactory({
            host: 'http://localhost',
            port: 1234
        });
        const client = factory.getClient<TestServiceMapping>();
        client.MyService.helloWorld().then(result => {
            expect(result).toBe('Hello World');
            expect(fetch).toHaveBeenCalledWith('http://localhost:1234/MyService%helloWorld', emptyRequest);
            done();
        });
    });
});

interface TestServiceMapping extends RpcServiceMapping {
    MyService: RpcClient<{
        helloWorld(): string;
    }>
}