export function decodeHtml(encoded) {
  if (!encoded) return '';
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(encoded, 'text/html');
    return doc.documentElement.textContent ?? encoded;
  }
  return encoded;
}
