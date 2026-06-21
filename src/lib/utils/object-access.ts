/**
 * Generic dot-path object getter + setter — used by admin settings forms to
 * read/write deep PensionParameters values like "tax_system.rates.stufe_2"
 * without writing per-field code.
 *
 * Extracted from pension-settings-panel.tsx so it can be unit tested and
 * reused by any future deep form (audit recommendation).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function set(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const last = keys.pop() as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parent = keys.reduce((acc: any, key: string) => (acc[key] ||= {}), obj);
  parent[last] = value;
}
