export function reportLovableError(error: unknown, meta?: Record<string, unknown>): void {
  try {
    console.error("[LovableError]", error, meta);
  } catch {
    // no-op
  }
}
