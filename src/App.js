import React, { useMemo, useState } from 'react';
import './App.css';
import Chart, { colorFor, bollToOverlays } from './components/Chart';
import { sma, ema, boll } from './lib/indicators';
import { compileExpr } from './lib/expr';
import { crosses, compare } from './lib/strategy';

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function genRandomPrices(n = 500, vol = 1.5) {
  const out = [];
  let price = 100;
  const dt = 1 / 252;
  for (let i = 0; i < n; i++) {
    const shock = randn() * vol * Math.sqrt(dt);
    price = Math.max(0.1, price * Math.exp(shock));
    out.push({ i, close: price });
  }
  return out;
}

export default function App() {
  const [points, setPoints] = useState(500);
  const [vol, setVol] = useState(1.5);
  const [data, setData] = useState(() => genRandomPrices(points, vol));

  const [indicators, setIndicators] = useState([]);
  const [strategies, setStrategies] = useState([]);

  const [builtinType, setBuiltinType] = useState('sma');
  const [indPeriod, setIndPeriod] = useState(20);
  const [bollMult, setBollMult] = useState(2);
  const [customExpr, setCustomExpr] = useState('');

  const [stratLeft, setStratLeft] = useState('close');
  const [stratOp, setStratOp] = useState('crosses_above');
  const [stratRight, setStratRight] = useState('sma(close, 50)');

  const closes = useMemo(() => data.map(d => d.close), [data]);
  const ctxObj = useMemo(() => ({ N: closes.length, close: closes }), [closes]);

  const compiledCache = useMemo(() => new Map(), []);
  function compileOrGet(expr) {
    const key = expr.trim();
    if (!compiledCache.has(key)) compiledCache.set(key, compileExpr(key));
    return compiledCache.get(key);
  }
  function evaluate(expr) {
    if (Array.isArray(expr)) return expr;
    if (typeof expr === 'function') return expr(ctxObj);
    if (typeof expr === 'string') return compileOrGet(expr)(ctxObj);
    throw new Error('Unsupported expr');
  }

  function onRegen() {
    const n = Math.max(50, Math.min(points, 5000));
    const v = Math.max(0.1, Math.min(vol, 10));
    setData(genRandomPrices(n, v));
  }

  function addBuiltinIndicator() {
    const id = 'ind-' + Math.random().toString(36).slice(2, 8);
    const color = colorFor(indicators.length);
    const period = Math.max(1, indPeriod | 0);
    if (builtinType === 'sma') {
      setIndicators(prev => [...prev, { id, name: `SMA(${period})`, type: 'sma', color, expr: 'close', func: sma, period }]);
    } else if (builtinType === 'ema') {
      setIndicators(prev => [...prev, { id, name: `EMA(${period})`, type: 'ema', color, expr: 'close', func: ema, period }]);
    } else {
      const mult = Math.max(0.5, +bollMult || 2);
      setIndicators(prev => [...prev, { id, name: `BOLL(${period},${mult})`, type: 'boll', color, expr: 'close', period, mult }]);
    }
  }
  function addCustomIndicator() {
    const expr = (customExpr || '').trim();
    if (!expr) return;
    try { compileOrGet(expr); } catch (e) { window.alert('Invalid formula: ' + e.message); return; }
    const id = 'ind-' + Math.random().toString(36).slice(2, 8);
    const color = colorFor(indicators.length);
    setIndicators(prev => [...prev, { id, name: expr, type: 'expr', color, expr, func: null, period: 0 }]);
    setCustomExpr('');
  }
  function removeIndicator(id) {
    setIndicators(prev => prev.filter(x => x.id !== id));
  }

  function addStrategy() {
    const leftExpr = (stratLeft || 'close').trim();
    const rightExpr = (stratRight || '').trim();
    const op = stratOp;
    if (!rightExpr) { window.alert('Right expression required'); return; }
    try { compileOrGet(leftExpr); compileOrGet(rightExpr); } catch (e) { window.alert('Invalid expression: ' + e.message); return; }
    const id = 'st-' + Math.random().toString(36).slice(2, 8);
    const color = colorFor(strategies.length);
    const name = `${leftExpr} ${op} ${rightExpr}`;
    setStrategies(prev => [...prev, { id, name, leftExpr, op, rightExpr, color }]);
  }
  function removeStrategy(id) {
    setStrategies(prev => prev.filter(x => x.id !== id));
  }

  const overlays = useMemo(() => {
    const items = [];
    indicators.forEach(ind => {
      if (ind.type === 'boll') {
        const arr = evaluate(ind.expr);
        const b = boll(arr, ind.period, ind.mult);
        items.push(...bollToOverlays(ind, b));
      } else {
        const arr = evaluate(ind.expr);
        const series = ind.func ? ind.func(arr, ind.period) : arr;
        items.push({ name: ind.name, color: ind.color, series });
      }
    });
    return items;
  }, [indicators, ctxObj]);

  const signals = useMemo(() => {
    const sigs = [];
    strategies.forEach(st => {
      const left = evaluate(st.leftExpr);
      const right = evaluate(st.rightExpr);
      for (let i = 1; i < ctxObj.N; i++) {
        let isBuy = false, isSell = false;
        if (st.op === 'crosses_above') isBuy = crosses(+1, left, right, i);
        else if (st.op === 'crosses_below') isSell = crosses(-1, left, right, i);
        else {
          if (isFinite(left[i]) && isFinite(right[i]) && compare(st.op, left[i], right[i])) {
            isBuy = true;
          }
        }
        if (isBuy) sigs.push({ i, type: 'buy', color: st.color });
        if (isSell) sigs.push({ i, type: 'sell', color: st.color });
      }
    });
    return sigs;
  }, [strategies, ctxObj]);

  return (
    <div className="app">
      <header>
        <h1>Custom Indicators & Strategies</h1>
        <div className="subtitle">Generate random price data, add indicators (SMA, EMA, Bollinger), custom formulas, and rule-based strategies with buy/sell signals.</div>
      </header>

      <section className="controls">
        <div className="panel">
          <h2>Data</h2>
          <div className="row">
            <label>
              Points
              <input type="number" min="50" max="5000" step="50" value={points} onChange={e => setPoints(+e.target.value)} />
            </label>
            <label>
              Volatility
              <input type="number" min="0.1" max="10" step="0.1" value={vol} onChange={e => setVol(+e.target.value)} />
            </label>
            <button onClick={onRegen}>Regenerate Data</button>
          </div>
        </div>

        <div className="panel">
          <h2>Indicators</h2>
          <div className="row">
            <label>
              Built-in
              <select value={builtinType} onChange={e => setBuiltinType(e.target.value)}>
                <option value="sma">SMA</option>
                <option value="ema">EMA</option>
                <option value="boll">Bollinger Bands</option>
              </select>
            </label>
            <label>
              Period
              <input type="number" min="1" max="500" step="1" value={indPeriod} onChange={e => setIndPeriod(+e.target.value)} />
            </label>
            <label className={builtinType !== 'boll' ? 'hidden' : ''}>
              Mult
              <input type="number" min="0.5" max="5" step="0.5" value={bollMult} onChange={e => setBollMult(+e.target.value)} />
            </label>
            <button onClick={addBuiltinIndicator}>Add Indicator</button>
          </div>
          <div className="row">
            <label className="grow">
              Custom formula
              <input type="text" placeholder="e.g., sma(close, 50) or ema(close, 21)" value={customExpr} onChange={e => setCustomExpr(e.target.value)} />
            </label>
            <button onClick={addCustomIndicator}>Add Custom</button>
          </div>
          <div className="help">
            Functions: sma(expr, n), ema(expr, n), boll_upper(expr, n, mult=2), boll_lower(...), boll_mid(...). expr can be close or another expression. Supports + - * / between expressions and numbers.
          </div>
          <ul className="list">
            {indicators.map(ind => (
              <li key={ind.id}>
                <span><span className="swatch" style={{ background: ind.color }}></span> {ind.name} <span className="meta">({ind.type})</span></span>
                <span className="actions">
                  <button onClick={() => removeIndicator(ind.id)}>Remove</button>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h2>Strategies</h2>
          <div className="row">
            <label className="grow">
              Left expr
              <input type="text" placeholder="e.g., close" value={stratLeft} onChange={e => setStratLeft(e.target.value)} />
            </label>
            <label>
              Operator
              <select value={stratOp} onChange={e => setStratOp(e.target.value)}>
                <option value="crosses_above">crosses above</option>
                <option value="crosses_below">crosses below</option>
                <option value=">">&gt;</option>
                <option value=">=">&gt;=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
                <option value="==">==</option>
              </select>
            </label>
            <label className="grow">
              Right expr
              <input type="text" placeholder="e.g., sma(close, 50)" value={stratRight} onChange={e => setStratRight(e.target.value)} />
            </label>
            <button onClick={addStrategy}>Add Strategy</button>
          </div>
          <div className="help">
            Example: Buy when close crosses above sma(close, 50). You can also use comparisons like close &gt; ema(close, 20).
          </div>
          <ul className="list">
            {strategies.map(st => (
              <li key={st.id}>
                <span><span className="swatch" style={{ background: st.color }}></span> {st.name}</span>
                <span className="actions">
                  <button onClick={() => removeStrategy(st.id)}>Remove</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="chart-section">
        <Chart data={data} overlays={overlays} signals={signals} />
        <div className="legend">
          {overlays.map((ov, idx) => (
            <div key={idx} className="item">
              <span className="swatch" style={{ background: ov.color }}></span>{ov.name}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
