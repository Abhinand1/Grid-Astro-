export function sanitizeInput(input: string): string {
  if (!input) return '';
  // Remove any HTML tags
  const noTags = input.replace(/<[^>]*>?/gm, '');
  // Remove special characters that might be used for injection, but allow basic punctuation and spaces
  // Allow alphanumeric, spaces, commas, periods, hyphens, and Malayalam characters
  const sanitized = noTags.replace(/[^\w\s\.,\-\u0D00-\u0D7F()]/gi, '');
  return sanitized.trim().substring(0, 100); // Limit length to 100 characters
}
