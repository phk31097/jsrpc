import type * as http from "http";
import type {IncomingMessage, Server, ServerResponse} from "http";
import {RpcRequestMatcher} from "./rpc-request-matcher";
import {RpcServiceConfiguration} from "./rpc-service-configuration";

interface RpcServerOptions {
    port: number;
}

export class RpcServer {
    private server: Server;

    constructor(private options: RpcServerOptions, private services: RpcServiceConfiguration<any>[]) {
        this.server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            try {
                const match = new RpcRequestMatcher(this.services).match(req.url!);

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