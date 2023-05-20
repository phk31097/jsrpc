import * as ts from "typescript";
import {ClassDeclaration} from "typescript";
import {rpcDecoratorName} from "./code-generator";

export function hasRpcDecorator(classDeclaration: ClassDeclaration): boolean {
    return (ts.getDecorators(classDeclaration) ?? [])
        .map(decorator => decorator.expression)
        .map(expression => {
            if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
                return expression.expression.text;
            }

            if (ts.isIdentifier(expression)) {
                return expression.text;
            }

            return '';
        })
        .map(decoratorName => decoratorName.toLowerCase())
        .some(name => name === rpcDecoratorName || name === `${rpcDecoratorName}()`);
}