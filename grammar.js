/**
 * @file Datawindow syntax grammar for Tree-sitter
 * @author Jose Cagnini <jose.cagnini@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: 'datawindow',

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  rules: {
    source_file: $ => seq(
      optional($.export_header),
      $.datawindow_file,
    ),

    datawindow_file: $ => seq(
      $.release_statement,
      repeat1($.datawindow_statement),
    ),

    release_statement: $ => seq(
      caseInsensitiveAlias('release'),
      alias(choice($.integer_literal, $.decimal_literal), $.release_version),
      ';',
    ),

    datawindow_statement: $ => choice(
      $.datawindow_method_invocation,
    ),

    datawindow_method_invocation: $ => seq(
      optional(alias(
        seq(
          choice(
            $.datawindow_method_invocation,
            $.datawindow_field_access,
            $.identifier,
          ),
          '.',
        ),
        $.object)),
      alias($.identifier, $.method),
      $.open_parenthesis,
      optional($.datawindow_property_list),
      $.close_parenthesis,
    ),

    datawindow_field_access: $ => seq(
      alias(
        choice(
          $.datawindow_method_invocation,
          $.datawindow_field_access,
          $.identifier,
        ),
        $.object,
      ),
      '.',
      alias($.identifier, $.field),
    ),

    datawindow_property_list: $ => repeat1($.datawindow_property_assignment),

    datawindow_property_assignment: $ => prec.right(seq(
      alias(
        choice(
          $.identifier,
          $.datawindow_field_access,
        ),
        $.property,
      ),
      '=',
      choice(
        alias($._literal, $.value),
        seq(alias($.identifier, $.value), optional(seq($.open_parenthesis, $._literal, $.close_parenthesis))),
        seq($.open_parenthesis, $.datawindow_property_list, $.close_parenthesis),
        seq($.open_parenthesis, commaSep($.datawindow_map_list), $.close_parenthesis),
      ),
    )),

    datawindow_map_list: $ => seq(
      $.open_parenthesis,
      commaSep(choice($._literal, alias($.identifier, $.value))),
      $.close_parenthesis,
    ),

    export_header: $ => seq(
      $.export_header_identifier,
      optional($.export_header_comments),
    ),

    export_header_identifier: $ => seq(
      alias(/(HA)?\$PBExportHeader\$/, $.export_header_identifier_text),
      $.export_header_identifier_content,
    ),

    export_header_identifier_content: $ => seq(alias($.identifier, $.file_name), '.', $.file_extension),

    export_header_comments: $ => seq(
      alias('$PBExportComments$', $.export_header_comments_text),
      alias(/[^\r\n]*/, $.export_header_comments_content),
    ),

    file_extension: $ => choice(
      alias('srd', $.dataobject_file_extension),
    ),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9\-_$#%]*/,

    _literal: $ => choice(
      $.integer_literal,
      $.decimal_literal,
      $.real_literal,
      $.string_literal,
      $.date_literal,
      $.time_literal,
      $.boolean_literal,
    ),

    integer_literal: _ => /\d+/,
    decimal_literal: _ => /\d*\.\d+/,
    real_literal: _ => /(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)[Ee][+-]?[0-9]+/,
    date_literal: _ => /(?:\d{4}-\d{2}-\d{2})/,
    time_literal: $ => /(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,6})?/,


    string_literal: $ => choice(
      seq($.double_quote, alias(repeat(token.immediate(prec(1, choice(/[^"\\]/, /\\./, /~"/)))), $.string_content), $.double_quote),
      seq($.single_quote, alias(repeat(token.immediate(prec(1, choice(/[^'\\]/, /\\./, /~'/)))), $.string_content), $.single_quote),
    ),

    boolean_literal: $ => choice(
      caseInsensitiveAlias('true'),
      caseInsensitiveAlias('false'),
    ),


    line_comment: _ => seq('//', token.immediate(prec(1, /.*/))),
    block_comment: _ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),

    open_parenthesis: _ => '(',
    close_parenthesis: _ => ')',
    single_quote: _ => '\'',
    double_quote: _ => '"',
  },
});


/**
 * Creates a case insensitive word
 *
 * @param {string} word
 *
 * @returns {RegExp}
 */
function caseInsensitiveRegExp(word) {
  return new RegExp(word.split('')
    .map(letter => `[${letter}${letter.toUpperCase()}]`)
    .join(''),
  );
}

/**
 * Creates a case insensitive alias rule
 *
 * @param {string} word
 *
 * @returns {AliasRule}
 */
function caseInsensitiveAlias(word) {
  return alias(caseInsensitiveRegExp(word), word);
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
