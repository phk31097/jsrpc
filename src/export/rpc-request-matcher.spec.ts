import {describe, it} from "@jest/globals";
import {RpcRequestMatcher} from "./rpc-request-matcher";

describe('RPC Request Matcher', () => {
    const emptyBody = {
        main: [],
        objects: [],
    };

    const matcher = new RpcRequestMatcher([
        { listensTo: ["MyService"], service: {helloWorld: () => {}} }
    ]);

    it('should match server requests', () => {
        const match = matcher.match('/MyService%helloWorld', emptyBody);
        expect(match.args).toHaveLength(0);
        expect(match.method).toBe('helloWorld');
    });

    it('should give an error if no services match', () => {
        expect(() => matcher.match('/HelloService%helloWorld', emptyBody)).toThrowError();
    });

    it('should give an error if no method specified', () => {
        expect(() => matcher.match('/MyService', emptyBody)).toThrowError();
    });

    it('should give an error if method is invalid', () => {
        expect(() => matcher.match('/MyService%myMethod', emptyBody)).toThrowError();
    });
});