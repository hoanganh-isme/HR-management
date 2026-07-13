window.SafeFormulaEvaluator = (function () {
  var functions = {
    min: Math.min,
    max: Math.max,
    round: Math.round,
    ceil: Math.ceil,
    floor: Math.floor,
    abs: Math.abs
  };

  function tokenize(expression) {
    var tokens = [];
    var index = 0;
    while (index < expression.length) {
      var rest = expression.slice(index);
      var whitespace = /^\s+/.exec(rest);
      if (whitespace) { index += whitespace[0].length; continue; }
      var number = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(rest);
      if (number) { tokens.push({ type: 'number', value: Number(number[0]) }); index += number[0].length; continue; }
      var identifier = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
      if (identifier) { tokens.push({ type: 'identifier', value: identifier[0].toLowerCase() }); index += identifier[0].length; continue; }
      var character = rest.charAt(0);
      if ('+-*/%(),'.indexOf(character) !== -1) { tokens.push({ type: character, value: character }); index += 1; continue; }
      throw new Error('Unsupported formula token at position ' + index);
    }
    return tokens;
  }

  function evaluate(formula, fields) {
    var expression = String(formula || '').replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, function (_, fieldName) {
      var value = fields && fields[fieldName];
      var number = Number(value === '' || value == null ? 0 : value);
      if (!Number.isFinite(number)) throw new Error('Formula field is not numeric: ' + fieldName);
      return String(number);
    });
    var tokens = tokenize(expression);
    var position = 0;

    function peek(type) { return tokens[position] && tokens[position].type === type; }
    function consume(type) {
      if (!peek(type)) throw new Error('Expected ' + type + ' in formula');
      return tokens[position++];
    }
    function primary() {
      if (peek('number')) return consume('number').value;
      if (peek('(')) { consume('('); var value = additive(); consume(')'); return value; }
      if (peek('identifier')) {
        var name = consume('identifier').value;
        if (!functions[name]) throw new Error('Formula function is not allowed: ' + name);
        consume('(');
        var args = [];
        if (!peek(')')) {
          args.push(additive());
          while (peek(',')) { consume(','); args.push(additive()); }
        }
        consume(')');
        return functions[name].apply(Math, args);
      }
      throw new Error('Invalid formula expression');
    }
    function unary() {
      if (peek('+')) { consume('+'); return unary(); }
      if (peek('-')) { consume('-'); return -unary(); }
      return primary();
    }
    function multiplicative() {
      var value = unary();
      while (peek('*') || peek('/') || peek('%')) {
        var operator = tokens[position++].type;
        var right = unary();
        value = operator === '*' ? value * right : (operator === '/' ? value / right : value % right);
      }
      return value;
    }
    function additive() {
      var value = multiplicative();
      while (peek('+') || peek('-')) {
        var operator = tokens[position++].type;
        var right = multiplicative();
        value = operator === '+' ? value + right : value - right;
      }
      return value;
    }

    var result = additive();
    if (position !== tokens.length || !Number.isFinite(result)) throw new Error('Formula did not produce a finite number');
    return result;
  }

  return { evaluate: evaluate };
})();

