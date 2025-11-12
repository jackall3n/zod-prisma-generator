import type { DMMF } from "@prisma/generator-helper";
import generator from '@prisma/generator-helper';
import ts from "typescript";
import fs from 'node:fs/promises';
import { join } from 'node:path';

const { factory } = ts;

const { generatorHandler } = generator;

generatorHandler({
    onManifest() {
        let version: string | undefined;

        try {
            const pkg = require('../package.json');
            version = pkg.version;
        } catch { }

        return {
            version,
            defaultOutput: './',
            prettyName: 'Zod Prisma Generator'
        };
    },
    async onGenerate(options) {
        console.log(options);

        const { generator } = options;

        const outputDir = generator.output?.value ?? "./";
        await fs.mkdir(outputDir, { recursive: true });

        await createEnumsFile(outputDir, generator.config.enums === "true" ? options.dmmf.datamodel.enums : []);
        await createIndexFile(outputDir);
    },
})

async function createEnumsFile(outputDir: string, enums: readonly DMMF.DatamodelEnum[]) {
    const source = ts.createSourceFile(
        "./generated/enums.ts",
        "",
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );

    const imports = factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
            undefined,
            undefined,
            factory.createNamedImports([
                factory.createImportSpecifier(
                    false,
                    undefined,
                    factory.createIdentifier("z"),
                )
            ]),
        ),
        factory.createStringLiteral("zod")
    )

    const statements: ts.Statement[] = [];

    for (const e of enums) {
        console.log(e.name, e.values);

        const schema = ts.factory.createVariableStatement(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        `${e.name}Schema`,
                        undefined,
                        undefined,
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("z"), ts.factory.createIdentifier("enum")),
                            undefined,
                            [
                                ts.factory.createArrayLiteralExpression(
                                    e.values.map(v => ts.factory.createStringLiteral(`${e.name}`)),
                                    false
                                )
                            ]
                        )
                    ),
                ],
                ts.NodeFlags.Const
            )
        )

        const infer = factory.createTypeAliasDeclaration(
            [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            e.name,
            undefined,
            factory.createTypeReferenceNode(
                factory.createQualifiedName(factory.createIdentifier("z"), factory.createIdentifier("infer")),
                [factory.createTypeQueryNode(factory.createIdentifier(`${e.name}Schema`))],
            ),
        );


        statements.push(schema);
        statements.push(infer);
    }

    const updatedSource = factory.updateSourceFile(source, [imports, ...statements]);

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const output = printer.printFile(updatedSource);

    await fs.writeFile(join(outputDir, "enums.ts"), output);

    return statements;
}

async function createIndexFile(outputDir: string) {
    const source = ts.createSourceFile(
        "./generated/index.ts",
        "",
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );


    // create index.ts with export * from './enums';
    const declaration = factory.createExportDeclaration(
        undefined,
        undefined as any,
        factory.createIdentifier("*") as any,
        factory.createStringLiteral("./enums") as any
    );

    const updatedSource = factory.updateSourceFile(source, [declaration]);

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const output = printer.printFile(updatedSource);

    await fs.writeFile(join(outputDir, "index.ts"), output);
}