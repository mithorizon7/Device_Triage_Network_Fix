import fs from "fs";
import path from "path";
import ts from "typescript";

const ROOT = path.resolve(process.cwd());
const SRC_DIR = path.join(ROOT, "client", "src");

const USER_FACING_ATTRS = new Set([
  "aria-label",
  "aria-roledescription",
  "aria-valuetext",
  "aria-description",
  "title",
  "alt",
  "placeholder",
  "label",
  "description",
]);

const ALLOWED_ATTRS = new Set([
  "className",
  "id",
  "key",
  "role",
  "type",
  "name",
  "value",
  "defaultValue",
  "checked",
  "disabled",
  "variant",
  "size",
  "color",
  "width",
  "height",
  "align",
  "target",
  "rel",
  "href",
  "to",
  "method",
  "action",
  "encType",
  "as",
  "asChild",
  "src",
  "ref",
  "tabIndex",
  "wrap",
  "min",
  "max",
  "step",
  "pattern",
  "inputMode",
  "autoComplete",
  "autoCorrect",
  "autoCapitalize",
  "spellCheck",
  "loading",
  "decoding",
  "fetchPriority",
  "sizes",
  "viewBox",
  "xmlns",
  "focusable",
  "fill",
  "stroke",
  "strokeWidth",
  "d",
  "cx",
  "cy",
  "r",
  "x",
  "y",
  "x1",
  "x2",
  "y1",
  "y2",
  "points",
  "offset",
  "stopColor",
  "stopOpacity",
  "transform",
  "opacity",
  "clipPath",
  "mask",
  "preserveAspectRatio",
  "aria-hidden",
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
  "aria-expanded",
  "aria-pressed",
  "aria-checked",
  "aria-selected",
  "aria-current",
  "aria-busy",
  "aria-live",
  "aria-atomic",
  "aria-relevant",
  "aria-invalid",
  "aria-required",
  "aria-multiline",
  "aria-orientation",
  "aria-valuemin",
  "aria-valuemax",
  "aria-valuenow",
  "aria-setsize",
  "aria-posinset",
  "aria-haspopup",
  "aria-owns",
  "aria-activedescendant",
  "aria-keyshortcuts",
  "aria-modal",
  "aria-readonly",
  "aria-disabled",
]);

const IGNORED_DIRS = new Set(["node_modules", "dist", "build", ".git"]);

type Issue = {
  file: string;
  line: number;
  column: number;
  message: string;
};

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function isWhitespaceOnly(text: string): boolean {
  return text.trim().length === 0;
}

function getPosition(sourceFile: ts.SourceFile, node: ts.Node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return { line: line + 1, column: character + 1 };
}

function getJsxAttributeName(name: ts.JsxAttributeName): string {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isJsxNamespacedName(name)) return `${name.namespace.text}:${name.name.text}`;
  return name.getText();
}

function shouldCheckAttribute(attrName: string): boolean {
  if (attrName.startsWith("data-")) return false;
  if (ALLOWED_ATTRS.has(attrName)) return false;
  if (USER_FACING_ATTRS.has(attrName)) return true;
  return false;
}

function reportIssue(issues: Issue[], sourceFile: ts.SourceFile, node: ts.Node, message: string) {
  const pos = getPosition(sourceFile, node);
  issues.push({ file: sourceFile.fileName, line: pos.line, column: pos.column, message });
}

function checkFile(filePath: string, issues: Issue[]) {
  const content = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      if (!isWhitespaceOnly(node.text)) {
        reportIssue(issues, sourceFile, node, `Hard-coded JSX text: "${node.text.trim()}"`);
      }
    }

    if (ts.isJsxExpression(node) && node.expression) {
      if (
        ts.isStringLiteral(node.expression) ||
        ts.isNoSubstitutionTemplateLiteral(node.expression)
      ) {
        const value = node.expression.text;
        if (!isWhitespaceOnly(value)) {
          reportIssue(
            issues,
            sourceFile,
            node,
            `Hard-coded JSX expression string: "${value.trim()}"`
          );
        }
      }
    }

    if (ts.isJsxAttribute(node)) {
      const attrName = getJsxAttributeName(node.name);
      if (!shouldCheckAttribute(attrName)) {
        ts.forEachChild(node, visit);
        return;
      }
      const initializer = node.initializer;
      if (initializer && ts.isStringLiteral(initializer)) {
        reportIssue(
          issues,
          sourceFile,
          initializer,
          `Hard-coded ${attrName} string: "${initializer.text}"`
        );
      }
      if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
        if (
          ts.isStringLiteral(initializer.expression) ||
          ts.isNoSubstitutionTemplateLiteral(initializer.expression)
        ) {
          reportIssue(
            issues,
            sourceFile,
            initializer,
            `Hard-coded ${attrName} string expression: "${initializer.expression.text}"`
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

function main() {
  const files = walk(SRC_DIR);
  const issues: Issue[] = [];
  files.forEach((file) => checkFile(file, issues));

  if (issues.length > 0) {
    const sorted = issues.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    console.error(`i18n lint found ${issues.length} issue(s):`);
    sorted.forEach((issue) => {
      const relative = path.relative(ROOT, issue.file);
      console.error(`${relative}:${issue.line}:${issue.column} ${issue.message}`);
    });
    process.exit(1);
  }

  console.log("i18n lint passed: no hard-coded JSX text or user-facing attribute strings found.");
}

main();
