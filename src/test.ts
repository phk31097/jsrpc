import * as ts from "typescript";
import {
    ClassDeclaration,
    EmitHint,
    InterfaceDeclaration,
    ParameterDeclaration, Program,
    PropertyDeclaration,
    SignatureKind,
    TypeNode
} from "typescript";

const rpcServiceInterfaceName = 'RpcService';

function classForRpcServiceInterface(itf: InterfaceDeclaration, program: Program): ClassDeclaration {
    const properties: PropertyDeclaration[] = [];
    const interfaceType = program.getTypeChecker().getTypeAtLocation(itf);

    interfaceType.getProperties().forEach(property => {
        const propertyType = program.getTypeChecker().getTypeOfSymbolAtLocation(property, itf);
        const signature = program.getTypeChecker().getSignaturesOfType(propertyType, SignatureKind.Call)[0];

        const typeParameters: ParameterDeclaration[] = signature.getParameters().map(param => {
            return ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                param.name,
                undefined,
                program.getTypeChecker().typeToTypeNode(program.getTypeChecker().getTypeOfSymbol(param), undefined, undefined),
            )
        });
        const returnType: TypeNode = ts.factory.createTypeReferenceNode('Promise', [program.getTypeChecker().typeToTypeNode(signature.getReturnType(), undefined, undefined)!])
        const functionType = ts.factory.createFunctionTypeNode(undefined, typeParameters, returnType);


        properties.push(ts.factory.createPropertyDeclaration(
            ts.factory.createNodeArray([ts.factory.createToken(ts.SyntaxKind.PublicKeyword)]),
            ts.factory.createIdentifier(property.name),
            undefined,
            functionType,
            undefined
        ));
    });

    return ts.factory.createClassDeclaration(
        undefined,
        ts.factory.createIdentifier(itf.name.text),
        undefined,
        [
            ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword,
                [
                    ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier(rpcServiceInterfaceName), undefined)
                ])
        ],
        properties,
    );
}

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
                const generatedClass = classForRpcServiceInterface(node, program);
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