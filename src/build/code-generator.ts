import * as ts from "typescript";
import {ClassDeclaration, DeclarationStatement, EmitHint, InterfaceDeclaration, Program, SourceFile} from "typescript";
import {generateClientClass} from "./generate-client-class.fn";
import {generateImport} from "./generate-import.fn";
import {hasRpcDecorator} from "./has-rpc-decorator.fn";
import {generateServerClass} from "./generate-server-class.fn";

const fs = require('fs');

export const rpcServerClassName = 'RpcServer';
export const rpcServiceInterfaceName = 'RpcService';
export const rpcClientInterfaceName = 'RpcClient';
export const rpcDecoratorName = 'rpc';

const PACKAGE_NAME = '@philippkoch/jsrpc';
const SERVER_CLASS_FILE_NAME = 'server.jsrpc.ts';
const CLIENT_CLASS_FILE_SUFFIX = '.jsrpc.ts';

interface RpcCodeGeneratorOptions {
    baseDirectory: string;
    sharedDirectory: string;
    clientDirectory: string;
    serverDirectory: string;
}

export class RpcCodeGenerator {

    protected program: Program;

    public constructor(protected options: RpcCodeGeneratorOptions) {
        this.program = ts.createProgram(this.getSharedFiles().concat(this.getServerFiles()), {
            noEmitOnError: true,
            noImplicitAny: true,
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
        });
    }

    public writeFile(fileName: string, content: string): void {
        fs.writeFileSync(fileName, content);
    }

    public getSharedFiles(): string[] {
        return fs.readdirSync([this.options.baseDirectory, this.options.sharedDirectory].join('/')).map((f: string) => [
            this.options.baseDirectory,
            this.options.sharedDirectory,
            f
        ].join('/'));
    }

    public getServerFiles(): string[] {
        return fs.readdirSync([this.options.baseDirectory, this.options.serverDirectory].join('/')).map((f: string) => [
            this.options.baseDirectory,
            this.options.serverDirectory,
            f
        ].join('/'));
    }

    public generate(): void {
        const printer = ts.createPrinter({ newLine: ts.NewLineKind.CarriageReturnLineFeed });

        const serviceCode: RpcServiceCode[] = [];
        this.program.getSourceFiles()
            .filter(sourceFile => !sourceFile.isDeclarationFile)
            .forEach(sourceFile => {
                ts.forEachChild(sourceFile, node => {
                    if (ts.isInterfaceDeclaration(node)) {
                        if (!node.heritageClauses?.find || !node.heritageClauses.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword && this.program.getTypeChecker().getFullyQualifiedName(this.program.getTypeChecker().getSymbolAtLocation(clause.types[0].expression)!) === rpcServiceInterfaceName)) {
                            return;
                        }
                        const clientFileName = sourceFile.fileName
                            .replace(this.options.sharedDirectory, this.options.clientDirectory)
                            .replace('\.ts', CLIENT_CLASS_FILE_SUFFIX);
                        let file = ts.createSourceFile("generatedSource.ts", "", ts.ScriptTarget.ES2015);

                        const clientClass = generateClientClass(node, this.program);

                        const output = [
                            generateImport(rpcClientInterfaceName, PACKAGE_NAME),
                            generateImport(node.name.text, sourceFile.fileName.replace(this.options.baseDirectory, '..')),
                            clientClass
                        ].map(n => printer.printNode(EmitHint.Unspecified, n, file));

                        this.writeFile(clientFileName, output.join('\n'));

                        serviceCode.push({
                            shared: {
                                location: sourceFile.fileName,
                                name: node.name.text,
                                code: node
                            },
                            client: {
                                location: clientFileName,
                                name: node.name.text + 'Client',
                                code: clientClass
                            }
                        })
                    } else if (ts.isClassDeclaration(node) && hasRpcDecorator(node)) {
                        if (node.heritageClauses?.find) {
                            const implementedInterfaces = node.heritageClauses
                                .filter(clause => clause.token === ts.SyntaxKind.ImplementsKeyword)
                                .flatMap(clause => clause.types.map(type => this.program.getTypeChecker().getFullyQualifiedName(this.program.getTypeChecker().getSymbolAtLocation(type.expression)!)));
                            serviceCode.forEach(code => {
                                if (implementedInterfaces.includes(code.shared.name)) {
                                    if (code.server) {
                                        throw new Error(`Multiple implementations found for ${code.shared.name}`);
                                    }
                                    code.server = {
                                        name: node.name!.text,
                                        location: sourceFile.fileName,
                                        code: node
                                    };
                                }
                            })
                            return;
                        }
                    }
                })
            })

        serviceCode.forEach(code => {
            if (!code.server) {
                throw new Error(`No implementation found for ${code.shared.name}`);
            }
        })

        let file = ts.createSourceFile(SERVER_CLASS_FILE_NAME, "", ts.ScriptTarget.ES2015);

        const output = [
            generateImport(rpcServerClassName, PACKAGE_NAME),
            ...serviceCode.map(classDeclaration => generateImport(classDeclaration.server!.name, this.getNameOfClassFile(classDeclaration.server!))),
            generateServerClass(serviceCode
                .filter(code => code.server && code.server.code)
                .map(d => d.server!.code))
        ].map(n => printer.printNode(EmitHint.Unspecified, n, file));
        this.writeFile([
            this.options.baseDirectory,
            this.options.serverDirectory,
            SERVER_CLASS_FILE_NAME
        ].join('/'), output.join('\n'));

        console.log('#########################################');
        console.log('The following services will be available:');
        console.log('#########################################');
        serviceCode.forEach(code => {
            console.log(code.shared.name);
            console.log(` ↳ ${code.client?.name}`)
            console.log(` ↳ ${code.server?.name}`)
        });
    }

    protected getNameOfClassFile(declaration: RpcServiceCodeLocation<ClassDeclaration>): string {
        return './' + declaration.location.split([
            this.options.baseDirectory,
            '/',
            this.options.serverDirectory,
            '/'
        ].join(''))[1];
    }
}

interface RpcServiceCode {
    shared: RpcServiceCodeLocation<InterfaceDeclaration>;
    server?: RpcServiceCodeLocation<ClassDeclaration>;
    client?: RpcServiceCodeLocation<ClassDeclaration>;
}

interface RpcServiceCodeLocation<T extends DeclarationStatement> {
    name: string;
    location: string;
    code: T;
}