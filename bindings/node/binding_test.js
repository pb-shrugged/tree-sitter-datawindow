import assert from "node:assert";
import { test } from "node:test";
import Parser from "tree-sitter";

test("can load datawindow grammar", async () => {
  const parser = new Parser();
  const { datawindow_syntax } = await import("./index.js");
  assert.doesNotThrow(() => parser.setLanguage(datawindow_syntax));
});

test("can load datawindow_expression grammar", async () => {
  const parser = new Parser();
  const { datawindow_expression } = await import("./index.js");
  assert.doesNotThrow(() => parser.setLanguage(datawindow_expression));
});
