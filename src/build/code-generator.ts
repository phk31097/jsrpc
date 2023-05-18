import * as ts from "typescript";
import {EmitHint, Program} from "typescript";
import {generateClientClass} from "./generate-client-class.fn";
import {generateImport} from "./generate-import.fn";

const fs = require('fs');

export const rpcServiceInterfaceName = 'RpcService';
export const rpcClientInterfaceName = 'RpcClient';
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
        this.program = ts.createProgram(this.getSharedFiles(), {
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

    public generate(): void {
        this.program.getSourceFiles()
            .filter(sourceFile => !sourceFile.isDeclarationFile)
            .forEach(sourceFile => {
                console.log(sourceFile.fileName);
                ts.forEachChild(sourceFile, node => {
                    if (ts.isInterfaceDeclaration(node)) {
                        const interfaceType = this.program.getTypeChecker().getTypeAtLocation(node);
                        if (!interfaceType.getBaseTypes()?.map(type => type.getSymbol()?.name).includes(rpcServiceInterfaceName)) {
                            return;
                        }
                        const clientFileName = sourceFile.fileName.replace(this.options.sharedDirectory, this.options.clientDirectory);
                        const printer = ts.createPrinter({ newLine: ts.NewLineKind.CarriageReturnLineFeed });
                        let file = ts.createSourceFile("generatedSource.ts", "", ts.ScriptTarget.ES2015);

                        const output = [
                            generateImport(rpcClientInterfaceName, PACKAGE_NAME),
                            generateImport(node.name.text, sourceFile.fileName.replace(this.options.baseDirectory, '..')),
                            generateClientClass(node, this.program)
                        ].map(n => printer.printNode(EmitHint.Unspecified, n, file));

                        this.writeFile(clientFileName, output.join('\n'));
                    }
                })
            })
    }
}