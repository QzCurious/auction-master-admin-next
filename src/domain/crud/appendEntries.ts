type Value = string | number | boolean | Date;

export function appendEntries(x: URLSearchParams | FormData, obj: Record<string, null | undefined | Value | Value[]>) {
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      for (const each of v) {
        x.append(k, convertToString(each));
      }
    } else if (v === null) {
      continue;
    } else if (v === undefined) {
      continue;
    } else if (typeof v === 'number' && isNaN(v)) {
      continue;
    } else {
      x.append(k, convertToString(v));
    }
  }
  return x;
}
function convertToString(v: Value): string {
  if (v === true) return 'true';
  if (v === false) return 'false';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return v.toString();
  if (v instanceof Date) return v.toISOString();

  v satisfies never;
  return v;
}
