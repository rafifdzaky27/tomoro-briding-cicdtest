import { buildAccurateSignature } from "./signature";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in env`);
  return v;
}

export async function accurateRequest<T>(args: {
  host: string; // https://account.accurate.id or https://zeus.accurate.id
  path: string; // /api/db-list.do , /api/open-db.do , /accurate/api/sales-invoice/save.do
  method: HttpMethod;
  sessionId?: string; // X-Session-ID for data host calls
  query?: Record<string, string | number | boolean | undefined | null>;
  // For Accurate endpoints, body often is application/x-www-form-urlencoded
  form?: Record<string, string | number | boolean | undefined | null>;
}) {
  const token = mustEnv("ACCURATE_API_TOKEN");

  const url = new URL(args.host + args.path);
  if (args.query) {
    for (const [k, v] of Object.entries(args.query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  // Build signature based on method + path + timestamp (+ optional query/body if your template includes it)
  const { ts, signature } = buildAccurateSignature({
    method: args.method,
    path: args.path.replace(args.host, ""), // keep just path
    query: args.query,
    body: args.form, // if your signature uses body; if not, harmless
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "X-Api-Timestamp": ts,
    "X-Api-Signature": signature,
  };

  if (args.sessionId) headers["X-Session-ID"] = args.sessionId;

  let body: BodyInit | undefined;

  if (args.form && (args.method === "POST" || args.method === "PUT")) {
    const formBody = new URLSearchParams();
    for (const [k, v] of Object.entries(args.form)) {
      if (v === undefined || v === null) continue;
      formBody.append(k, String(v));
    }
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = formBody.toString();
  }

  const res = await fetch(url.toString(), { method: args.method, headers, body });

  const text = await res.text();
  // Accurate sering balikin JSON
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Accurate HTTP ${res.status}: ${text}`);
  }
  return json as T;
}
