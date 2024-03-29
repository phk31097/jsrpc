import * as ts from "typescript";
import {NamedImportBindings} from "typescript";

export function generateImport(element: string, location: string) {
    return ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
            false,
            undefined,
            generateNamedBindings(element)
        ),
        ts.factory.createStringLiteral(location.replace('.ts', '')));
}

function generateNamedBindings(name: string): NamedImportBindings {
    return ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(name)
        )
    ]);
}