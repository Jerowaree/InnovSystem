export function getRequestFingerprint(request: Request, identifier: string) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown-ip";
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown-ip";

  return `${identifier.trim().toLowerCase()}|${ip}|${userAgent}`;
}
