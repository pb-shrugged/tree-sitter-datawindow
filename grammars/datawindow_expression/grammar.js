/**
 * @file Datawindow syntax grammar for Tree-sitter
 * @author Jose Cagnini <jose.cagnini@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  OR: 1,
  AND: 2,
  EQUALITY: 3,
  RELATIONAL: 4,
  ADDITIVE: 5,
  MULTIPLICATIVE: 6,
  EXPONENTIATION: 7,
};


export default grammar({
  name: 'datawindow_expression',

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],


  rules: {
    source_file: $ => $.expression,

    expression: $ => choice(
      alias($.identifier, $.column),
      $._literal,
      $.method_invocation,
      $.field_access,
      $.binary_expression,
      $.parenthesized_expression,
    ),

    method_invocation: $ => seq(
      optional(
        seq(
          alias(
            choice(
              $.method_invocation,
              $.field_access,
              $.identifier,
            ),
            $.object),
          '.',
        ),
      ),
      alias($.identifier, $.method),
      $.open_parenthesis,
      optional($.parameter_list),
      $.close_parenthesis,
    ),

    field_access: $ => seq(
      alias(
        choice(
          $.method_invocation,
          $.field_access,
          $.identifier,
        ),
        $.object,
      ),
      '.',
      alias($.identifier, $.field),
    ),

    parameter_list: $ => commaSep1(choice(
      $.expression,
    )),

    parenthesized_expression: $ => seq(
      $.open_parenthesis,
      $.expression,
      $.close_parenthesis,
    ),

    binary_expression: $ => {
      const table = [
        { operator: '+', precedence: PREC.ADDITIVE },
        { operator: '-', precedence: PREC.ADDITIVE },
        { operator: '*', precedence: PREC.MULTIPLICATIVE },
        { operator: '/', precedence: PREC.MULTIPLICATIVE },
        { operator: '^', precedence: PREC.EXPONENTIATION },
        { operator: caseInsensitiveAlias('or'), precedence: PREC.OR },
        { operator: caseInsensitiveAlias('and'), precedence: PREC.AND },
        { operator: '=', precedence: PREC.EQUALITY },
        { operator: '<>', precedence: PREC.EQUALITY },
        { operator: '>', precedence: PREC.RELATIONAL },
        { operator: '<', precedence: PREC.RELATIONAL },
        { operator: '>=', precedence: PREC.RELATIONAL },
        { operator: '<=', precedence: PREC.RELATIONAL },
      ];

      return choice(...table.map(({ operator, precedence }) => {
        return prec.left(precedence, seq(
          alias($.expression, $.left_expression),
          alias(operator, $.operator),
          alias($.expression, $.right_expression),
        ));
      }));
    },


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
    // @ts-ignore
    time_literal: $ => /(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,6})?/,


    string_literal: $ => choice(
      seq($.double_quote, alias(repeat(token.immediate(prec(1, choice(/[^"\\]/, /\\./, /~"/)))), $.string_content), $.double_quote),
      seq($.single_quote, alias(repeat(token.immediate(prec(1, choice(/[^'\\]/, /\\./, /~'/)))), $.string_content), $.single_quote),
    ),

    // @ts-ignore
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
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
