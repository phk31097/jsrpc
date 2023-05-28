import * as http from "http";
import {IncomingMessage, Server, ServerResponse} from "http";
import {RpcRequestMatcher} from "../rpc-request-matcher";
import {RpcServiceConfiguration} from "../rpc-service-configuration";
import {RpcServerConfiguration} from "../rpc-server-configuration";

export class RpcServer {
    private server: Server;

    constructor(private config: RpcServerConfiguration, private services: RpcServiceConfiguration<any>[]) {
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
        this.server.listen(this.config.port, () => {
            console.log(`Server is running on port ${this.config.port}`);
        });
    }

    close(): void {
        this.server.close();
    }
}