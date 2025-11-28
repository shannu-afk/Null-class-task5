import { sma, ema, boll } from './indicators';

class ExprParser {
  constructor(input) { this.s = input.trim(); this.i = 0; }
  peek() { return this.s[this.i]; }
  eof() { return this.i >= this.s.length; }
  skipWs() { while (!this.eof() && /\s/.test(this.peek())) this.i++; }
  parseNumber() {
    this.skipWs();
    const m = /^(\d+\.?\d*|\.\d+)/.exec(this.s.slice(this.i));
    if (!m) return null;
    this.i += m[0].length;
    return { type: 'num', value: parseFloat(m[0]) };
  }
  parseIdent() {
    this.skipWs();
    const m = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(this.s.slice(this.i));
    if (!m) return null;
    this.i += m[0].length;
    return { type: 'id', name: m[0] };
  }
  expect(ch) {
    this.skipWs();
    if (this.peek() !== ch) throw new Error(`Expected '${ch}' at pos ${this.i}`);
    this.i++;
  }
  parsePrimary() {
    this.skipWs();
    if (this.peek() === '(') {
      this.i++;
      const e = this.parseExpr();
      this.expect(')');
      return e;
    }
    const num = this.parseNumber();
    if (num) return num;
    const id = this.parseIdent();
    if (id) {
      this.skipWs();
      if (this.peek() === '(') {
        this.i++;
        const args = [];
        this.skipWs();
        if (this.peek() !== ')') {
          while (true) {
            const arg = this.parseExpr();
            args.push(arg);
            this.skipWs();
            if (this.peek() === ',') { this.i++; continue; }
            break;
          }
        }
        this.expect(')');
        return { type: 'call', name: id.name, args };
      }
      return id;
    }
    throw new Error(`Unexpected token at pos ${this.i}`);
  }
  parseFactor() { return this.parsePrimary(); }
  parseTerm() {
    let node = this.parseFactor();
    while (true) {
      this.skipWs();
      const ch = this.peek();
      if (ch === '*' || ch === '/') {
        this.i++;
        const rhs = this.parseFactor();
        node = { type: 'bin', op: ch, left: node, right: rhs };
      } else break;
    }
    return node;
  }
  parseExpr() {
    let node = this.parseTerm();
    while (true) {
      this.skipWs();
      const ch = this.peek();
      if (ch === '+' || ch === '-') {
        this.i++;
        const rhs = this.parseTerm();
        node = { type: 'bin', op: ch, left: node, right: rhs };
      } else break;
    }
    return node;
  }
}

export function compileExpr(exprStr) {
  const ast = new ExprParser(exprStr).parseExpr();
  function evalNode(node, ctx) {
    switch (node.type) {
      case 'num': {
        return new Array(ctx.N).fill(node.value);
      }
      case 'id': {
        if (node.name === 'close') return ctx.close;
        throw new Error(`Unknown identifier '${node.name}'. Supported: close`);
      }
      case 'bin': {
        const a = evalNode(node.left, ctx);
        const b = evalNode(node.right, ctx);
        const res = new Array(ctx.N);
        for (let i = 0; i < ctx.N; i++) {
          const x = a[i], y = b[i];
          switch (node.op) {
            case '+': res[i] = x + y; break;
            case '-': res[i] = x - y; break;
            case '*': res[i] = x * y; break;
            case '/': res[i] = y === 0 ? NaN : x / y; break;
            default: res[i] = NaN;
          }
        }
        return res;
      }
      case 'call': {
        const name = node.name.toLowerCase();
        if (name === 'sma') {
          if (node.args.length !== 2) throw new Error('sma(expr, n) expects 2 args');
          const arr = evalNode(node.args[0], ctx);
          const n = asPeriod(node.args[1], ctx);
          return sma(arr, n);
        }
        if (name === 'ema') {
          if (node.args.length !== 2) throw new Error('ema(expr, n) expects 2 args');
          const arr = evalNode(node.args[0], ctx);
          const n = asPeriod(node.args[1], ctx);
          return ema(arr, n);
        }
        if (name === 'boll_upper' || name === 'boll_lower' || name === 'boll_mid') {
          const nargs = node.args.length;
          if (nargs < 2 || nargs > 3) throw new Error('boll_*(expr, n, mult=2) expects 2-3 args');
          const arr = evalNode(node.args[0], ctx);
          const n = asPeriod(node.args[1], ctx);
          const mult = nargs === 3 ? asNumber(node.args[2], ctx) : 2;
          const b = boll(arr, n, mult);
          if (name === 'boll_upper') return b.upper;
          if (name === 'boll_lower') return b.lower;
          return b.mid;
        }
        throw new Error(`Unknown function ${node.name}`);
      }
      default: throw new Error('Unknown AST node');
    }
  }
  function asPeriod(node, ctx) {
    if (node.type === 'num') return Math.max(1, node.value | 0);
    const arr = evalNode(node, ctx);
    const v = arr[arr.length - 1];
    return Math.max(1, (v | 0));
  }
  function asNumber(node, ctx) {
    if (node.type === 'num') return node.value;
    const arr = evalNode(node, ctx);
    return arr[arr.length - 1];
  }
  return function (ctx) { return evalNode(ast, ctx); };
}
