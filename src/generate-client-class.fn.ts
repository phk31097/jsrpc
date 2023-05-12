import * as ts from "typescript";
import {
    ClassDeclaration,
    InterfaceDeclaration,
    ParameterDeclaration,
    Program,
    PropertyDeclaration,
    SignatureKind,
    SyntaxKind,
    TypeNode
} from "typescript";
import {rpcServiceInterfaceName} from "./test";


export function generateClientClass(itf: InterfaceDeclaration, program: Program): ClassDeclaration {
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
        [ts.factory.createModifier(SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(itf.name.text + 'Client'),
        undefined,
        [
            /*ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword,
                [
                    ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier(rpcServiceInterfaceName), undefined)
                ])*/
        ],
        properties,
    );
}