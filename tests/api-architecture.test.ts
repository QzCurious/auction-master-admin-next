import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import * as ts from 'typescript';

import inventory from './fixtures/api-inventory.json';

async function sourceFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await sourceFiles(file)));
    else if (/\.tsx?$/.test(file)) result.push(file);
  }
  return result;
}

async function sourceGraph() {
  const files = await sourceFiles('src');
  const sources = new Map(await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')] as const)));
  const parsed = new Map(
    [...sources].map(([file, text]) => [file, ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)])
  );
  function resolve(file: string, specifier: string) {
    const base = specifier.startsWith('@/')
      ? `src/${specifier.slice(2)}`
      : specifier.startsWith('.')
        ? path.normalize(path.join(path.dirname(file), specifier))
        : undefined;
    return (
      base &&
      [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((candidate) =>
        sources.has(candidate)
      )
    );
  }
  function imports(file: string, runtimeOnly = false) {
    const result: string[] = [];
    for (const node of parsed.get(file)!.statements) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        if (
          runtimeOnly &&
          (clause?.isTypeOnly ||
            (!clause?.name &&
              clause?.namedBindings &&
              ts.isNamedImports(clause.namedBindings) &&
              clause.namedBindings.elements.every((element) => element.isTypeOnly)))
        )
          continue;
        result.push(node.moduleSpecifier.text);
      }
      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        if (runtimeOnly && node.isTypeOnly) continue;
        result.push(node.moduleSpecifier.text);
      }
    }
    return result;
  }
  return { sources, parsed, resolve, imports };
}

void test('all 70 API operations exist at their original hierarchy and load without request context', async () => {
  const actual = (await sourceFiles('src/api'))
    .map((file) => path.relative('src/api', file))
    .filter((file) => file !== 'core/static.ts')
    .sort();
  assert.deepEqual(
    actual,
    inventory,
    'an original API must not disappear, remain under endpoints/, or become a framework wrapper'
  );
  for (const relative of inventory) {
    const apiModule = (await import(path.resolve('src/api', relative))) as Record<string, unknown>;
    const name = path.basename(relative, '.ts');
    assert.equal(typeof apiModule[name], 'function', `${relative} must retain its original function name`);
  }
  const config = JSON.parse(await readFile('tsconfig.json', 'utf8')) as {
    compilerOptions: { paths: Record<string, string[]> };
  };
  assert.deepEqual(config.compilerOptions.paths['@/*'], ['./src/*']);
  assert.ok(!Object.keys(config.compilerOptions.paths).some((alias) => alias.startsWith('$api')));
});

void test('the entire API dependency graph excludes framework, session, environment, and presentation adapters', async () => {
  const graph = await sourceGraph();
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = graph.sources.get(file)!;
    assert.doesNotMatch(
      source,
      /['"]use (?:server|client)['"]|\bprocess\.env\b|\b(?:cookies|headers|redirect|revalidateTag|revalidatePath)\s*\(/,
      file
    );
    for (const specifier of graph.imports(file)) {
      assert.doesNotMatch(
        specifier,
        /^(?:next(?:\/|$)|react(?:\/|$)|react-router(?:\/|$)|@tanstack\/|server-only$|@\/server(?:-action)?\/|@\/query\/|@\/domain\/(?:auth|api)\/)/,
        `${file}: ${specifier}`
      );
      const dependency = graph.resolve(file, specifier);
      if (dependency) {
        assert.doesNotMatch(
          dependency,
          /^src\/(?:server(?:-action)?|query)\/|^src\/domain\/(?:auth|api)\//,
          `${file}: ${dependency}`
        );
        visit(dependency);
      }
    }
    function inspect(node: ts.Node) {
      if (ts.isPropertyAssignment(node))
        assert.notEqual(node.name.getText(), 'next', `${file}: cache options belong to adapters`);
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
        assert.fail(`${file}: audit dynamic dependencies explicitly`);
      ts.forEachChild(node, inspect);
    }
    inspect(graph.parsed.get(file)!);
  }
  for (const file of graph.sources.keys()) if (file.startsWith('src/api/')) visit(file);
});

void test('browser dependency graphs reach Server Actions instead of raw HTTP operations', async () => {
  const graph = await sourceGraph();
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = graph.sources.get(file)!;
    if (/['"]use server['"]/.test(source)) return; // Next.js replaces this module with a remote action reference.
    assert.ok(!file.startsWith('src/api/'), `browser runtime must call a Server Action: ${file}`);
    assert.ok(!file.startsWith('src/server/'), `browser runtime must not import server infrastructure: ${file}`);
    for (const specifier of graph.imports(file, true)) {
      const dependency = graph.resolve(file, specifier);
      if (dependency) visit(dependency);
    }
  }
  for (const [file, source] of graph.sources) if (/['"]use client['"]/.test(source)) visit(file);
  for (const file of await sourceFiles('src/server-action')) {
    assert.match(graph.sources.get(file)!, /^['"]use server['"];/, file);
    const api = file.replace('src/server-action/', 'src/api/');
    assert.ok(graph.sources.has(api), `action must mirror an API path: ${file}`);
    assert.ok(
      graph.imports(file).some((specifier) => graph.resolve(file, specifier) === api),
      `action must invoke its API: ${file}`
    );
  }
});
