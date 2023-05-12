import * as ts from "typescript";
import {EmitHint, ParameterDeclaration, SignatureKind, TypeNode, TypeParameterDeclaration} from "typescript";

const rpcServiceInterfaceName = 'MySuperInterface';

function compile(fileNames: string[], options: ts.CompilerOptions): void {
    let program = ts.createProgram(fileNames, options);

    const properties = [ts.factory.createPropertyDeclaration(
        ts.factory.createNodeArray([ts.factory.createToken(ts.SyntaxKind.PublicKeyword)]),
        ts.factory.createIdentifier("myGeneratedProperty"),
        /*questionOrExclamationToken*/ undefined,
        /*type*/ undefined,
        /*initializer*/ undefined
    )];

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
                console.log(`${node.name.escapedText} (I)`);
                interfaceType.getProperties().forEach(property => {
                    const propertyType = program.getTypeChecker().getTypeOfSymbolAtLocation(property, node);
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
                        /*questionOrExclamationToken*/ undefined,
                        functionType,
                        ///*type*/ program.getTypeChecker().typeToTypeNode(propertyType, undefined, undefined),
                        /*initializer*/ undefined
                    ));

                    const returnTypeAsString = program.getTypeChecker().typeToString(signature.getReturnType());
                    const parameters = signature.getParameters();
                    console.log(`${property.escapedName} -> ${returnTypeAsString}`);
                    parameters.forEach(param => {
                        const paramType = program.getTypeChecker().typeToString(program.getTypeChecker().getTypeOfSymbol(param));
                        console.log(`${param.escapedName} -> ${paramType}`);
                    });
                });
            }
        })
    })

    const generatedClass = ts.factory.createClassDeclaration(
        undefined,
        ts.factory.createIdentifier("MyGeneratedClass"),
        undefined,
        [
            ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword,
            [
                ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier(rpcServiceInterfaceName),undefined)
            ])
        ],
        properties,
    );
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.CarriageReturnLineFeed });
    let file = ts.createSourceFile("generatedSource.ts", "", ts.ScriptTarget.ES2015);
    console.log('#######');
    console.log(printer.printNode(EmitHint.Unspecified, generatedClass, file));
    console.log('#######');
}

compile(['src/my-class.ts'], {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
});