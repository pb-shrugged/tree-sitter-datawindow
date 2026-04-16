#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_datawindow();
extern "C" TSLanguage *tree_sitter_datawindow_expression();

// "tree-sitter", "language" hashed with BLAKE2
const napi_type_tag LANGUAGE_TYPE_TAG = {
    0x8AF2E5212AD58ABF, 0xD5006CAD83ABBA16
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    auto datawindow = Napi::External<TSLanguage>::New(env, tree_sitter_datawindow());
    datawindow.TypeTag(&LANGUAGE_TYPE_TAG);
    exports["datawindow"] = datawindow;

    auto datawindow_expression = Napi::External<TSLanguage>::New(env, tree_sitter_datawindow_expression());
    datawindow_expression.TypeTag(&LANGUAGE_TYPE_TAG);
    exports["datawindow_expression"] = datawindow_expression;

    return exports;
}

NODE_API_MODULE(tree_sitter_datawindow_binding, Init)
