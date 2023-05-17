import * as ts from "typescript";
import {
    ClassDeclaration,
    InterfaceDeclaration,
    MethodDeclaration,
    ParameterDeclaration,
    Program,
    SignatureKind,
    SyntaxKind,
    TypeNode
} from "typescript";
import {rpcClientInterfaceName} from "./code-generator";


export function generateClientClass(itf: InterfaceDeclaration, program: Program): ClassDeclaration {
    const methodDeclarations: MethodDeclaration[] = [];
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

        methodDeclarations.push(ts.factory.createMethodDeclaration(
            [ts.factory.createToken(ts.SyntaxKind.PublicKeyword)],
            undefined,
            property.name,
            undefined,
            undefined,
            [],

            functionType,
            ts.factory.createBlock([
                ts.factory.createThrowStatement(
                    ts.factory.createNewExpression(
                        ts.factory.createIdentifier('Error'),
                        undefined,
                        [ts.factory.createStringLiteral('Incorrect usage! Use the client factory instead!')]
                    )
                )
            ])
        ));
    });

    return ts.factory.createClassDeclaration(
        [ts.factory.createModifier(SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(itf.name.text + 'Client'),
        undefined,
        [
            ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword,
                [
                    ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier(rpcClientInterfaceName), [program.getTypeChecker().typeToTypeNode(interfaceType, undefined, undefined)!])
                ])
        ],
        methodDeclarations,
    );
}