export function crosses(dir, a, b, i) {
  if (i === 0) return false;
  const prevA = a[i - 1], prevB = b[i - 1];
  const curA = a[i], curB = b[i];
  if ([prevA, prevB, curA, curB].some(x => isNaN(x))) return false;
  return dir > 0 ? (prevA <= prevB && curA > curB) : (prevA >= prevB && curA < curB);
}

export function compare(op, x, y) {
  switch (op) {
    case '>': return x > y;
    case '>=': return x >= y;
    case '<': return x < y;
    case '<=': return x <= y;
    case '==': return x === y;
    default: return false;
  }
}
