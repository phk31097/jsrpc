import * as ts from "typescript";
import {EmitHint, Program} from "typescript";
import {generateClientClass} from "./generate-client-class.fn";

export const rpcServiceInterfaceName = 'RpcService';
export const rpcClientInterfaceName = 'RpcClient';

function compile(fileNames: string[], options: ts.CompilerOptions): void {
    let program: Program = ts.createProgram(fileNames, options);

    program.getSourceFiles()
        .filter(sourceFile => !sourceFile.isDeclarationFile)
        .forEach(sourceFile => {
        console.log(sourceFile.fileName);
        ts.forEachChild(sourceFile, node => {
            if (ts.isInterfaceDeclaration(node)) {
                const interfaceType = program.getTypeChecker().getTypeAtLocation(node);
                if (!interfaceType.getBaseTypes()?.map(type => type.getSymbol()?.name).includes(rpcServiceInterfaceName)) {
                    return;
                }
                const printer = ts.createPrinter({ newLine: ts.NewLineKind.CarriageReturnLineFeed });
                let file = ts.createSourceFile("generatedSource.ts", "", ts.ScriptTarget.ES2015);
                const generatedClass = generateClientClass(node, program);
                console.log('#######');
                console.log(printer.printNode(EmitHint.Unspecified, generatedClass, file));
                console.log('#######');
            }
        })
    })
}

compile(['src/my-class.ts'], {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
});