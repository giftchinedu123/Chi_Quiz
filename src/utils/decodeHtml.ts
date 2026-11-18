/**
 * Safely decodes HTML entities returned by Open Trivia DB without using dangerouslySetInnerHTML.
 */
export function decodeHtml(encoded: string): string {
  if (!encoded) return '';
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(encoded, 'text/html');
    return doc.documentElement.textContent ?? encoded;
  }
  return encoded;
}
