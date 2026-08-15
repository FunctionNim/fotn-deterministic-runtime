import { performance } from 'node:perf_hooks';

export function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1))];
}
export function summarizeSamples(samples) {
  const s=[...samples].sort((a,b)=>a-b);
  return {samples:s.length,p50:percentile(s,.50),p95:percentile(s,.95),p99:percentile(s,.99),min:s[0],max:s.at(-1),mean:s.reduce((a,b)=>a+b,0)/s.length};
}
export async function timed(fn) {
  const t0=performance.now(); const value=await fn(); return {value,ms:performance.now()-t0};
}
