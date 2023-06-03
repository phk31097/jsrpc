import * as http from "http";
import {IncomingMessage, Server, ServerResponse} from "http";
import {RpcRequestMatcher} from "../rpc-request-matcher";
import {RpcServiceConfiguration} from "../rpc-service-configuration";
import {RpcServerConfiguration} from "../rpc-server-configuration";
import {RpcSerializer} from "../rpc-serializer";

export class RpcServer {
    private server: Server;

    constructor(private config: RpcServerConfiguration, private services: RpcServiceConfiguration<any>[]) {
        this.server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                try {
                    console.log(body);
                    const match = new RpcRequestMatcher(this.services).match(req.url!, JSON.parse(body));

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    const response = RpcSerializer.getSerializedObject((match.service[match.method] as Function)(...match.args));
                    res.write(JSON.stringify(response));
                } catch (e: any) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    if ('message' in e) {
                        res.write(JSON.stringify({error: e.message}));
                    } else {
                        res.write(JSON.stringify({error: 'Unknown error'}));
                    }
                }

                res.end();
            });
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