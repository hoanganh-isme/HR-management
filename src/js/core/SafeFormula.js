/** Small arithmetic evaluator for metadata formulas; never executes code. */
window.SafeFormula = (function () {
  function evaluate(input) {
    var expression = String(input == null ? '' : input).trim();
    var tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/]/g);
    if (!tokens || tokens.join('') !== expression.replace(/\s+/g, '')) throw new Error('Unsupported formula');
    var index = 0;

    function primary() {
      var token = tokens[index++];
      if (token === '(') {
        var value = additive();
        if (tokens[index++] !== ')') throw new Error('Unbalanced formula');
        return value;
      }
      if (token === '+' || token === '-') {
        var next = primary();
        return token === '-' ? -next : next;
      }
      var number = Number(token);
      if (!isFinite(number)) throw new Error('Invalid number');
      return number;
    }

    function multiplicative() {
      var value = primary();
      while (tokens[index] === '*' || tokens[index] === '/') {
        var operator = tokens[index++];
        var right = primary();
        if (operator === '/' && right === 0) throw new Error('Division by zero');
        value = operator === '*' ? value * right : value / right;
      }
      return value;
    }

    function additive() {
      var value = multiplicative();
      while (tokens[index] === '+' || tokens[index] === '-') {
        var operator = tokens[index++];
        var right = multiplicative();
        value = operator === '+' ? value + right : value - right;
      }
      return value;
    }

    var result = additive();
    if (index !== tokens.length || !isFinite(result)) throw new Error('Unsupported formula');
    return result;
  }

  return { evaluate: evaluate };
})();
