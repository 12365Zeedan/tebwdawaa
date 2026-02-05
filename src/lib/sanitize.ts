/**
 * Sanitize user input for use in Supabase PostgREST filter strings.
 * Removes characters that could manipulate filter syntax (commas, parens, dots used as operators).
 * Also enforces a max length to prevent abuse.
 */
export function sanitizeSearchInput(input: string, maxLength = 100): string {
  // Truncate to max length
  const trimmed = input.slice(0, maxLength);
  // Remove characters that affect PostgREST filter syntax: commas, parentheses, and dots
  // Dots are used as operator separators in PostgREST (e.g., "name.ilike")
  return trimmed.replace(/[,().]/g, '');
}

/**
 * UUID v4 regex for validating UUID strings.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID v4.
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}
