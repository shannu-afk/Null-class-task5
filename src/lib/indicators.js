export function sma(arr, period) {
  period = Math.max(1, period | 0);
  const res = new Array(arr.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= period) sum -= arr[i - period];
    if (i >= period - 1) res[i] = sum / period;
  }
  return res;
}

export function ema(arr, period) {
  period = Math.max(1, period | 0);
  const res = new Array(arr.length).fill(NaN);
  const k = 2 / (period + 1);
  let prev = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (i === 0) res[i] = prev;
    else {
      prev = arr[i] * k + prev * (1 - k);
      res[i] = prev;
    }
  }
  return res;
}

export function stdev(arr, period) {
  period = Math.max(1, period | 0);
  const res = new Array(arr.length).fill(NaN);
  let sum = 0, sumSq = 0;
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    sum += x; sumSq += x * x;
    if (i >= period) {
      const y = arr[i - period];
      sum -= y; sumSq -= y * y;
    }
    if (i >= period - 1) {
      const mean = sum / period;
      const variance = sumSq / period - mean * mean;
      res[i] = Math.sqrt(Math.max(variance, 0));
    }
  }
  return res;
}

export function boll(arr, period, mult = 2) {
  const mid = sma(arr, period);
  const sd = stdev(arr, period);
  const upper = mid.map((m, i) => (isNaN(m) || isNaN(sd[i]) ? NaN : m + mult * sd[i]));
  const lower = mid.map((m, i) => (isNaN(m) || isNaN(sd[i]) ? NaN : m - mult * sd[i]));
  return { upper, mid, lower };
}
