import * as ts from "typescript";
import {NamedImportBindings} from "typescript";

export function generateImport(element: string, location: string, namespaceImport = false) {
    return ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
            false,
            undefined,
            generateNamedBindings(element, namespaceImport)
        ),
        ts.factory.createStringLiteral(location.replace('.ts', '')));
}

function generateNamedBindings(name: string, namespaceImport: boolean): NamedImportBindings {
    if (namespaceImport) {
        return ts.factory.createNamespaceImport(ts.factory.createIdentifier(name));
    }
    return ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(name)
        )
    ]);
}