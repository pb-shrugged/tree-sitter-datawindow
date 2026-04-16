/**
 * @file Datawindow syntax grammar for Tree-sitter
 * @author Jose Cagnini <jose.cagnini@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "datawindow",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
