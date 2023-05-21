import * as ts from "typescript";
import {InterfaceDeclaration, SyntaxKind} from "typescript";
import {rpcClientInterfaceName, RpcServiceCode, rpcServiceMappingInterfaceName} from "./code-generator";

export function generateClientMapping(codeList: RpcServiceCode[]): InterfaceDeclaration {

    const methodDeclarations = codeList.map(code =>
        ts.factory.createPropertySignature(
            undefined,
            code.shared.name,
            undefined,
            ts.factory.createTypeReferenceNode(rpcClientInterfaceName, [ts.factory.createTypeReferenceNode(code.shared.name)])
        )
    );

    return ts.factory.createInterfaceDeclaration(
        [ts.factory.createModifier(SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier('ServiceMapping'),
        undefined,
        [
            ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword,
                [ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier(rpcServiceMappingInterfaceName), undefined)])
        ],
        methodDeclarations,
    );
}
