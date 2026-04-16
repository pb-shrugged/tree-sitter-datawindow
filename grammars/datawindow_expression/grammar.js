/**
 * @file Datawindow syntax grammar for Tree-sitter
 * @author Jose Cagnini <jose.cagnini@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: 'datawindow_expression',

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],


  rules: {
    source_file: $ => 'hello',

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
