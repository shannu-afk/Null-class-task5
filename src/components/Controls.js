import React from 'react';

export default function Controls({
  onRegen, points, setPoints, vol, setVol,
  addBuiltinIndicator, addCustomIndicator, indicators, removeIndicator,
  addStrategy, strategies, removeStrategy,
  builtinType, setBuiltinType, indPeriod, setIndPeriod, bollMult, setBollMult,
  customExpr, setCustomExpr,
  stratLeft, setStratLeft, stratOp, setStratOp, stratRight, setStratRight
}) {
  return (
    <section className="controls">
      <div className="panel">
        <h2>Data</h2>
        <div className="row">
          <label>Points
            <input type="number" min="50" max="5000" step="50" value={points} onChange={e => setPoints(+e.target.value)} />
          </label>
          <label>Volatility
            <input type="number" min="0.1" max="10" step="0.1" value={vol} onChange={e => setVol(+e.target.value)} />
          </label>
          <button onClick={onRegen}>Regenerate Data</button>
        </div>
      </div>

      <div className="panel">
        <h2>Indicators</h2>
        <div className="row">
          <label>Built-in
            <select value={builtinType} onChange={e => setBuiltinType(e.target.value)}>
              <option value="sma">SMA</option>
              <option value="ema">EMA</option>
              <option value="boll">Bollinger Bands</option>
            </select>
          </label>
          <label>Period
            <input type="number" min="1" max="500" step="1" value={indPeriod} onChange={e => setIndPeriod(+e.target.value)} />
          </label>
          <label className={builtinType !== 'boll' ? 'hidden' : ''}>Mult
            <input type="number" min="0.5" max="5" step="0.5" value={bollMult} onChange={e => setBollMult(+e.target.value)} />
          </label>
          <button onClick={() => addBuiltinIndicator()}>Add Indicator</button>
        </div>
        <div className="row">
          <label className="grow">Custom formula
            <input type="text" placeholder="e.g., sma(close, 50) or ema(close, 21)" value={customExpr} onChange={e => setCustomExpr(e.target.value)} />
          </label>
          <button onClick={() => addCustomIndicator()}>Add Custom</button>
        </div>
        <div className="help">
          Functions: sma(expr, n), ema(expr, n), boll_upper(expr, n, mult=2), boll_lower(...), boll_mid(...). expr can be close or another expression. Supports + - * / between expressions and numbers.
        </div>
        <ul className="list">
          {indicators.map(ind => (
            <li key={ind.id}>
              <span><span className="swatch" style={{ background: ind.color }} /> {ind.name} <span className="meta">({ind.type})</span></span>
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
          <label className="grow">Left expr
            <input type="text" placeholder="e.g., close" value={stratLeft} onChange={e => setStratLeft(e.target.value)} />
          </label>
          <label>Operator
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
          <label className="grow">Right expr
            <input type="text" placeholder="e.g., sma(close, 50)" value={stratRight} onChange={e => setStratRight(e.target.value)} />
          </label>
          <button onClick={() => addStrategy()}>Add Strategy</button>
        </div>
        <div className="help">
          Example: Buy when close crosses above sma(close, 50). You can also use comparisons like close &gt; ema(close, 20).
        </div>
        <ul className="list">
          {strategies.map(st => (
            <li key={st.id}>
              <span><span className="swatch" style={{ background: st.color }} /> {st.name}</span>
              <span className="actions">
                <button onClick={() => removeStrategy(st.id)}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
