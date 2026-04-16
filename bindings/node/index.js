import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

const binding = (await import("node-gyp-build")).default(root);

function loadMetadata(name, path) {
  const nativeLang = binding[name];
  
  const lang = {
    language: nativeLang
  };
  
  try {
    const nodeTypes = JSON.parse(readFileSync(`${root}/${path}/src/node-types.json`, "utf8"));
    lang.nodeTypeInfo = nodeTypes;
  } catch { }

  const queries = [
    ["HIGHLIGHTS_QUERY", `${root}/queries/highlights.scm`],
    ["INJECTIONS_QUERY", `${root}/queries/injections.scm`],
    ["LOCALS_QUERY", `${root}/queries/locals.scm`],
    ["TAGS_QUERY", `${root}/queries/tags.scm`],
  ];

  for (const [prop, queryPath] of queries) {
    try {
      Object.defineProperty(lang, prop, {
        configurable: true,
        enumerable: true,
        get() {
          delete lang[prop];
          try {
            lang[prop] = readFileSync(queryPath, "utf8");
          } catch { }
          return lang[prop];
        }
      });
    } catch { }
  }
  return lang;
}

export const datawindow = loadMetadata("datawindow", "grammars/datawindow_syntax");
export const datawindow_expression = loadMetadata("datawindow_expression", "grammars/datawindow_expression");

export default {
  datawindow,
  datawindow_expression
};
