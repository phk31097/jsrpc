import * as http from "http";
import {IncomingMessage, Server, ServerResponse} from "http";
import {RpcService} from "./rpc-service";
import {rpc} from "./rpc-decorator";
import {RpcRequestMatcher} from "./rpc-request-matcher";

interface RpcServerOptions {
    port: number;
}

export class RpcServer {
    private server: Server;
    public static services: RpcService[] = [];

    constructor(private options: RpcServerOptions) {
        this.server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            try {
                const match = new RpcRequestMatcher(RpcServer.services).match(req.url!);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({response: (match.service[match.method] as Function)(...match.args)}));
            } catch (e: any) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                if ('message' in e) {
                    res.write(JSON.stringify({error: e.message}));
                } else {
                    res.write(JSON.stringify({error: 'Unknown error'}));
                }
            }

            res.end();
        })
    }

    listen(): void {
        this.server.listen(this.options.port, () => {
            console.log(`Server is running on port ${this.options.port}`);
        });
    }

    close(): void {
        this.server.close();
    }
}

@rpc
class RandomServiceClass {
    myMethod(param1: string) {
        return 'Hello ' + param1;
    }
}