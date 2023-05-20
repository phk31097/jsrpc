import * as ts from "typescript";
import {ClassDeclaration, EmitHint, Program, SourceFile} from "typescript";
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

        const classDeclarations: ClassDeclarationInFile[] = [];
        this.program.getSourceFiles()
            .filter(sourceFile => !sourceFile.isDeclarationFile)
            .forEach(sourceFile => {
                console.log(sourceFile.fileName);
                ts.forEachChild(sourceFile, node => {
                    if (ts.isInterfaceDeclaration(node)) {
                        if (!node.heritageClauses?.find || !node.heritageClauses.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword && this.program.getTypeChecker().getFullyQualifiedName(this.program.getTypeChecker().getSymbolAtLocation(clause.types[0].expression)!) === rpcServiceInterfaceName)) {
                            return;
                        }
                        const clientFileName = sourceFile.fileName.replace(this.options.sharedDirectory, this.options.clientDirectory);
                        let file = ts.createSourceFile("generatedSource.ts", "", ts.ScriptTarget.ES2015);

                        const output = [
                            generateImport(rpcClientInterfaceName, PACKAGE_NAME),
                            generateImport(node.name.text, sourceFile.fileName.replace(this.options.baseDirectory, '..')),
                            generateClientClass(node, this.program)
                        ].map(n => printer.printNode(EmitHint.Unspecified, n, file));

                        this.writeFile(clientFileName, output.join('\n'));
                    } else if (ts.isClassDeclaration(node) && hasRpcDecorator(node)) {
                        console.log(node.name?.text);
                        classDeclarations.push([node, sourceFile]);
                    }
                })
            })
        let file = ts.createSourceFile("server.ts", "", ts.ScriptTarget.ES2015);

        const output = [
            generateImport(rpcServerClassName, PACKAGE_NAME),
            ...classDeclarations.map(classDeclaration => generateImport(classDeclaration[0].name!.text, this.getNameOfClassFile(classDeclaration))),
            generateServerClass(classDeclarations.map(d => d[0]))
        ].map(n => printer.printNode(EmitHint.Unspecified, n, file));
        this.writeFile([
            this.options.baseDirectory,
            this.options.serverDirectory,
            'server.ts'
        ].join('/'), output.join('\n'));
    }

    protected getNameOfClassFile(declaration: ClassDeclarationInFile): string {
        return './' + declaration[1].fileName.split([
            this.options.baseDirectory,
            '/',
            this.options.serverDirectory,
            '/'
        ].join(''))[1];
    }
}

type ClassDeclarationInFile = [declaration: ClassDeclaration, file: SourceFile];