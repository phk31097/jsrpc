import * as ts from "typescript";

export function generateImport(element: string, location: string) {
    return ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier(element)
                )
            ])),
        ts.factory.createStringLiteral(location.replace('.ts', '')));
}