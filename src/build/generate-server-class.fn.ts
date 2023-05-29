import ts from "typescript";
import {RpcServerClassMapping} from "./code-generator";
import {JsrpcProject} from "./jsrpc-project";

export function generateServerClass(
    classDeclarations: RpcServerClassMapping[],
    project: JsrpcProject
): ts.ExpressionStatement {
    const serviceInstantiations = classDeclarations.map((classDeclaration) =>
        ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment("listensTo", ts.factory.createArrayLiteralExpression(
                classDeclaration.listensTo.map(interfaceName => ts.factory.createStringLiteral(interfaceName))
            )),
            ts.factory.createPropertyAssignment("service", ts.factory.createNewExpression(ts.factory.createIdentifier(classDeclaration.code.name), undefined, [])),
        ])
    );

    const servicesArray = ts.factory.createArrayLiteralExpression(serviceInstantiations);

    const jsrpcProjectInit = ts.factory.createPropertyAccessExpression(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier('JsrpcProject'),
                ts.factory.createIdentifier('init')
            ),
            undefined,
            []
        ),
        ts.factory.createIdentifier('configuration')
    );

    const rpcServerInstantiation = ts.factory.createNewExpression(
        ts.factory.createIdentifier("RpcServer"),
        undefined,
        [
            ts.factory.createPropertyAccessExpression(jsrpcProjectInit, ts.factory.createIdentifier('server')),
            servicesArray
        ]
    );

    const listenMethodCall = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(rpcServerInstantiation, "listen"),
        undefined,
        []
    );

    return ts.factory.createExpressionStatement(listenMethodCall);
}
