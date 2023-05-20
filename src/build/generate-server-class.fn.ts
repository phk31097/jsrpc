import ts from "typescript";

export function generateServerClass(classDeclarations: ts.ClassDeclaration[]): ts.ExpressionStatement {
    const portArgument = ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment('port', ts.factory.createNumericLiteral('3000'))
    ]);

    const serviceInstantiations = classDeclarations.map(classDeclaration =>
        ts.factory.createNewExpression(ts.factory.createIdentifier(classDeclaration.name!.text), undefined, [])
    );

    const servicesArray = ts.factory.createArrayLiteralExpression(serviceInstantiations);

    const rpcServerInstantiation = ts.factory.createNewExpression(
        ts.factory.createIdentifier('RpcServer'),
        undefined,
        [portArgument, servicesArray]
    );

    const listenMethodCall = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(rpcServerInstantiation, 'listen'),
        undefined,
        []
    );

    const fullStatement = ts.factory.createExpressionStatement(listenMethodCall);

    return fullStatement;
}