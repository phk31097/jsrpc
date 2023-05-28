import {JsrpcConfig, JsrpcConfigValidator} from "../export/jsrpc-config";
import {RpcCodeGenerator} from "./code-generator";
import * as tsNode from 'ts-node';

const fs = require('fs');
const path = require('path');

export class JsrpcProject {
    public static PROJECT_FILE_NAME = 'jsrpc.json';
    public configuration: JsrpcConfig

    protected constructor(public dir: string) {
        console.log(`Project initialized in directory '${dir}'`)
        this.configuration = JsrpcConfigValidator.getConfig(JSON.parse(fs.readFileSync(path.resolve(this.dir, JsrpcProject.PROJECT_FILE_NAME))));
    }

    public static init(): JsrpcProject {
        return new JsrpcProject(JsrpcProject.findProjectFile(process.cwd()));
    }

    protected static findProjectFile(dir: string): string {
        if (dir === '/') {
            throw new Error(`Unable to locate '${JsrpcProject.PROJECT_FILE_NAME}'`);
        }
        if (!fs.existsSync(path.resolve(dir, JsrpcProject.PROJECT_FILE_NAME))) {
            return JsrpcProject.findProjectFile(path.resolve(dir, '..'));
        }
        return dir;
    }

    public generateCode(): void {
        new RpcCodeGenerator(this).generate();
    }

    public startServer(): void {
        tsNode.register();
        require(path.resolve(this.dir,
            this.configuration.code.baseDirectory,
            this.configuration.code.serverDirectory,
            this.configuration.code.serverFileName))
    }

    public pathInBasePath(...paths: string[]): string {
        return path.resolve(this.dir, this.configuration.code.baseDirectory, ...paths);
    }

    public getSharedFiles(): string[] {
        return fs.readdirSync(this.pathInBasePath(this.configuration.code.sharedDirectory));
    }

    public getServerFiles(): string[] {
        return fs.readdirSync(this.pathInBasePath(this.configuration.code.serverDirectory));
    }

    public getClientFiles(): string[] {
        return fs.readdirSync(this.pathInBasePath(this.configuration.code.clientDirectory));
    }

    public getServerFile(): string {
        return this.pathInBasePath(this.configuration.code.serverDirectory, this.configuration.code.serverFileName);
    }

    public getClientFile(): string {
        return this.pathInBasePath(this.configuration.code.clientDirectory, this.configuration.code.clientFileName);
    }
}