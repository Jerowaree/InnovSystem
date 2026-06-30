import { NextResponse } from "next/server";

const PRIVATE_API_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

const PUBLIC_INTERNAL_ERROR_PATTERNS = [
  /syntaxerror/i,
  /typeerror/i,
  /unexpected token/i,
  /unexpected end of json/i,
  /failed to fetch/i,
  /network/i,
  /timeout/i,
  /json/i,
  /sunat_credentials_master_key/i,
  /fetch failed/i,
  /cannot /i,
];

export function privateJson(
  body: unknown,
  init?: ResponseInit
) {
  const response = NextResponse.json(body, init);

  for (const [header, value] of Object.entries(PRIVATE_API_HEADERS)) {
    response.headers.set(header, value);
  }

  return response;
}

export function withPrivateHeaders(response: NextResponse) {
  for (const [header, value] of Object.entries(PRIVATE_API_HEADERS)) {
    response.headers.set(header, value);
  }

  return response;
}

export function assertJsonBodyRequest(
  request: Request,
  options?: { maxBytes?: number }
) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Envia la informacion en formato JSON.");
  }

  const maxBytes = options?.maxBytes ?? 16 * 1024;
  const contentLengthHeader = request.headers.get("content-length");

  if (!contentLengthHeader) {
    return;
  }

  const contentLength = Number(contentLengthHeader);

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("La solicitud es demasiado grande.");
  }
}

export async function readJsonBodyRequest<T>(
  request: Request,
  options?: { maxBytes?: number }
): Promise<T> {
  assertJsonBodyRequest(request, options);

  const rawBody = await request.text();
  const maxBytes = options?.maxBytes ?? 16 * 1024;
  const bodySizeBytes = new TextEncoder().encode(rawBody).byteLength;

  if (bodySizeBytes > maxBytes) {
    throw new Error("La solicitud es demasiado grande.");
  }

  if (!rawBody.trim()) {
    throw new Error("Completa la información requerida antes de continuar.");
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new Error("La información enviada no tiene un formato valido.");
  }
}

export function toPublicErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.trim();

  if (!message) {
    return fallback;
  }

  if (PUBLIC_INTERNAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return fallback;
  }

  return message;
}
