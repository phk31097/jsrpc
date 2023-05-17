import * as ts from "typescript";
import {EmitHint, Program} from "typescript";
import {generateClientClass} from "./generate-client-class.fn";

export const rpcServiceInterfaceName = 'RpcService';
export const rpcClientInterfaceName = 'RpcClient';

interface RpcCodeGeneratorOptions {
    sharedDirectory: string;
    clientDirectory: string;
    serverDirectory: string;
}

export class RpcCodeGenerator {

    protected program: Program;

    public constructor(private options?: RpcCodeGeneratorOptions) {
        const fileNames = ['src/my-class.ts'];
        this.program = ts.createProgram(fileNames, {
            noEmitOnError: true,
            noImplicitAny: true,
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
        });
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
                        const printer = ts.createPrinter({ newLine: ts.NewLineKind.CarriageReturnLineFeed });
                        let file = ts.createSourceFile("generatedSource.ts", "", ts.ScriptTarget.ES2015);
                        const generatedClass = generateClientClass(node, this.program);
                        console.log('#######');
                        console.log(printer.printNode(EmitHint.Unspecified, generatedClass, file));
                        console.log('#######');
                    }
                })
            })
    }
}