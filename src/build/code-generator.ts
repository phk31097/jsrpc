import * as ts from "typescript";
import {ClassDeclaration, DeclarationStatement, EmitHint, InterfaceDeclaration, Program} from "typescript";
import {generateClientMapping} from "./generate-client-mapping.fn";
import {generateImport} from "./generate-import.fn";
import {hasRpcDecorator} from "./has-rpc-decorator.fn";
import {generateServerClass} from "./generate-server-class.fn";
import {JsrpcConfig} from "../export/jsrpc-config";
import {JsrpcProject} from "./jsrpc-project";

const fs = require('fs');

export const rpcServerClassName = 'RpcServer';
export const rpcServiceInterfaceName = 'RpcService';
export const rpcClientInterfaceName = 'RpcClient';
export const rpcServiceMappingInterfaceName = 'RpcServiceMapping';
export const rpcDecoratorName = 'rpc';

const PACKAGE_NAME = '@philippkoch/jsrpc';
const SERVER_PACKAGE_NAME = '@philippkoch/jsrpc/server';

export class RpcCodeGenerator {

    protected program: Program;
    protected configuration: JsrpcConfig;

    public constructor(protected project: JsrpcProject) {
        this.configuration = project.configuration;
        this.program = ts.createProgram(project.getServerFiles().concat(project.getSharedFiles()), {
            noEmitOnError: true,
            noImplicitAny: true,
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
        });
    }

    public writeFile(fileName: string, content: string): void {
        fs.writeFileSync(fileName, content);
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
                        serviceCode.push({
                            shared: {
                                location: sourceFile.fileName,
                                name: node.name.text,
                                code: node
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

        let file = ts.createSourceFile(this.configuration.code.serverFileName, "", ts.ScriptTarget.ES2015);

        const uniqueServerClasses: RpcServerClassMapping[] = [];
        for (const declaration of serviceCode.map(code => code.server)) {
            if (!uniqueServerClasses.find(mapping => declaration!.name === mapping.code.name)) {
                uniqueServerClasses.push({
                    code: declaration!,
                    listensTo: serviceCode.filter(code => code.server?.name === declaration?.name).map(code => code.shared.name)
                });
            }
        }

        const serverOutput = [
            generateImport(rpcServerClassName, SERVER_PACKAGE_NAME),
            generateImport('config', '../../' + JsrpcProject.PROJECT_FILE_NAME, true), // FIXME relative paths
            ...uniqueServerClasses.map(declaration => generateImport(declaration.code.name, './' + this.getNameOfClassFile(declaration.code))),
            generateServerClass(uniqueServerClasses, this.project)
        ].map(n => printer.printNode(EmitHint.Unspecified, n, file));
        this.writeFile(this.project.getServerFile(), serverOutput.join('\n'));

        const clientOutput = [
            generateImport(rpcServiceMappingInterfaceName, PACKAGE_NAME),
            generateImport(rpcClientInterfaceName, PACKAGE_NAME),
            ...serviceCode.map(code => generateImport(code.shared.name, '..' + code.shared.location.split(this.configuration.code.baseDirectory)[1])),
            generateClientMapping(serviceCode)
        ].map(n => printer.printNode(EmitHint.Unspecified, n, file));
        this.writeFile(this.project.getClientFile(), clientOutput.join('\n'));

        console.log('#########################################');
        console.log('The following services will be available:');
        console.log('#########################################');
        serviceCode.forEach(code => {
            console.log(code.shared.name);
            console.log(` ↳ ${code.server?.name}`)
        });
    }

    protected getNameOfClassFile(declaration: RpcServiceCodeLocation<ClassDeclaration>): string {
        const split = declaration.location.split('/');
        return split[split.length - 1];
    }
}

export interface RpcServiceCode {
    shared: RpcServiceCodeLocation<InterfaceDeclaration>;
    server?: RpcServiceCodeLocation<ClassDeclaration>;
}

interface RpcServiceCodeLocation<T extends DeclarationStatement> {
    name: string;
    location: string;
    code: T;
}

export interface RpcServerClassMapping {
    code: RpcServiceCodeLocation<ClassDeclaration>;
    listensTo: string[];
}