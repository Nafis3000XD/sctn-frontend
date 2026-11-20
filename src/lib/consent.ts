export function parseRequestedData(data: string): string {
  try {
    const parsed: unknown = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
  } catch {
    return data;
  }
}
