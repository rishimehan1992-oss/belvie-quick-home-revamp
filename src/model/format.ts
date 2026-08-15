export function lakhs(x: number): string {
  return Number.isFinite(x) ? (x / 1e5).toFixed(2) : "—";
}

export function crores(x: number): string {
  return Number.isFinite(x) ? (x / 1e7).toFixed(2) : "—";
}

export function rupees(x: number): string {
  return Number.isFinite(x) ? `₹${Math.round(x).toLocaleString("en-IN")}` : "—";
}

export function integer(x: number): string {
  return Number.isFinite(x) ? Math.round(x).toLocaleString("en-IN") : "—";
}

export function feasibilityReason(row: {
  feasible: boolean;
  capOK: boolean;
}): string {
  if (row.feasible) return "Yes";
  return row.capOK ? "route" : "capacity";
}
