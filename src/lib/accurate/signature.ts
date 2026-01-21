import crypto from "crypto";

type Digest = "hex" | "base64";

function toUnixSeconds(date = new Date()): string {
  return Math.floor(date.getTime() / 1000).toString();
}

function normalizeQuery(query?: Record<string, string | number | boolean | undefined | null>) {
  if (!query) return "";
  const entries = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  // querystring without leading "?"
  return entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

function stableJson(body: unknown): string {
  if (body === undefined || body === null) return "";
  // stable stringify: sort keys to keep deterministic
  const seen = new WeakSet();
  const sorter = (_key: string, value: any) => {
    if (value && typeof value === "object") {
      if (seen.has(value)) return value; // avoid crash
      seen.add(value);
      if (Array.isArray(value)) return value;
      return Object.keys(value)
        .sort()
        .reduce((acc: any, k) => {
          acc[k] = value[k];
          return acc;
        }, {});
    }
    return value;
  };
  return JSON.stringify(body, sorter);
}

export function buildAccurateSignature(args: {
  method: string;
  path: string; // e.g. /api/db-list.do or /accurate/api/sales-invoice/save.do
  timestamp?: string; // unix seconds
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown; // object for JSON, or record for form; see notes below
}) {
  const secret = process.env.ACCURATE_SIGNATURE_SECRET;
  if (!secret) throw new Error("Missing ACCURATE_SIGNATURE_SECRET in env");

  const ts = args.timestamp ?? toUnixSeconds();
  const method = args.method.toUpperCase();
  const path = args.path; // keep leading /

  const queryStr = normalizeQuery(args.query);
  const bodyStr = stableJson(args.body);

  const template = process.env.ACCURATE_STRING_TO_SIGN ?? "{METHOD}:{PATH}:{TIMESTAMP}";
  const stringToSign = template
    .replaceAll("{METHOD}", method)
    .replaceAll("{PATH}", path)
    .replaceAll("{TIMESTAMP}", ts)
    .replaceAll("{QUERY}", queryStr)
    .replaceAll("{BODY}", bodyStr);

  const digest = (process.env.ACCURATE_SIGNATURE_DIGEST as Digest) ?? "hex";

  const signature = crypto.createHmac("sha256", secret).update(stringToSign).digest(digest);

  return { ts, signature, stringToSign };
}
