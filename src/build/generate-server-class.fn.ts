import ts from "typescript";
import {RpcServerClassMapping} from "./code-generator";
import {JsrpcProject} from "./jsrpc-project";

export function generateServerClass(
    classDeclarations: RpcServerClassMapping[],
    project: JsrpcProject
): ts.ExpressionStatement {
    const portArgument = ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment("port", ts.factory.createNumericLiteral(project.configuration.server.port)),
        ts.factory.createPropertyAssignment("host", ts.factory.createStringLiteral(project.configuration.server.host)),
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
