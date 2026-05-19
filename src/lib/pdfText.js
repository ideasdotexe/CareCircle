// Best-effort text extraction from text-based PDFs.
// Works for hospital/lab PDFs with selectable text (not scanned images).
export function extractTextFromPdfBase64(base64) {
  try {
    const binary = atob(base64);
    const parts = [];

    // Extract paren-delimited strings used with Tj/TJ operators
    const parenRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*T[jJ]/g;
    let m;
    while ((m = parenRe.exec(binary)) !== null) {
      const text = m[1].replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\t/g, '\t').replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
      const cleaned = text.replace(/[^\x20-\x7E\t]/g, '').trim();
      if (cleaned.length > 1) parts.push(cleaned);
    }

    // Extract hex-encoded strings
    const hexRe = /<([0-9a-fA-F]{2,})>\s*T[jJ]/g;
    while ((m = hexRe.exec(binary)) !== null) {
      let text = '';
      for (let i = 0; i < m[1].length; i += 2) {
        const code = parseInt(m[1].slice(i, i + 2), 16);
        if (code > 31 && code < 128) text += String.fromCharCode(code);
      }
      if (text.trim().length > 1) parts.push(text.trim());
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}