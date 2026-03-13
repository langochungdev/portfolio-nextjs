export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExcerpt(content: string, maxLength = 160): string {
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s\S*$/, "")}...`;
}

export function calcReadTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
