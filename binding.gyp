{
  "targets": [
    {
      "target_name": "tree_sitter_datawindow_binding",
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
      ],
      "include_dirs": [
        "grammars/datawindow_syntax/src",
        "grammars/datawindow_expression/src",
      ],
      "sources": [
        "bindings/node/binding.cc",
        "grammars/datawindow_syntax/src/parser.c",
        "grammars/datawindow_expression/src/parser.c",
      ],
      "variables": {
        "has_scanner_syntax": "<!(node -p \"fs.existsSync('grammars/datawindow_syntax/src/scanner.c')\")",
        "has_scanner_expression": "<!(node -p \"fs.existsSync('grammars/datawindow_expression/src/scanner.c')\")"
      },
      "conditions": [
        ["has_scanner_syntax=='true'", {
          "sources+": ["grammars/datawindow_syntax/src/scanner.c"],
        }],
        ["has_scanner_expression=='true'", {
          "sources+": ["grammars/datawindow_expression/src/scanner.c"],
        }],
        ["OS!='win'", {
          "cflags_c": [
            "-std=c11",
          ],
        }, { # OS == "win"
          "cflags_c": [
            "/std:c11",
            "/utf-8",
          ],
        }],
      ],
    }
  ]
}
