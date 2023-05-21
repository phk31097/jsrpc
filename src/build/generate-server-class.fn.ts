import ts from "typescript";
import {RpcServerClassMapping} from "./code-generator";

export function generateServerClass(
    classDeclarations: RpcServerClassMapping[]
): ts.ExpressionStatement {
    const portArgument = ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment("port", ts.factory.createNumericLiteral("3000")),
    ]);

    const serviceInstantiations = classDeclarations.map((classDeclaration) =>
        ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("listensTo", ts.factory.createArrayLiteralExpression(
                classDeclaration.listensTo.map(interfaceName => ts.factory.createStringLiteral(interfaceName))
            )),
            ts.factory.createPropertyAssignment("service", ts.factory.createNewExpression(ts.factory.createIdentifier(classDeclaration.code.name), undefined, [])),
        ])
    );

    const servicesArray = ts.factory.createArrayLiteralExpression(serviceInstantiations);

    const rpcServerInstantiation = ts.factory.createNewExpression(
        ts.factory.createIdentifier("RpcServer"),
        undefined,
        [portArgument, servicesArray]
    );

    const listenMethodCall = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(rpcServerInstantiation, "listen"),
        undefined,
        []
    );

    return ts.factory.createExpressionStatement(listenMethodCall);
}
