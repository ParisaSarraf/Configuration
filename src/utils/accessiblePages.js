// Display-only normalization. This list must not grant document-file access.
export const normalizeAccessiblePages = (pages) => {
  if (!Array.isArray(pages)) return [];
  const seen = new Set();
  return pages.flatMap((page) => {
    const isDescriptor = page != null && typeof page === "object" && !Array.isArray(page);
    const label = isDescriptor
      ? [page.persian_title, page.display_name, page.label, page.title, page.name,
          page.english_title, page.path, page.route, page.url, page.slug, page.code, page.id]
          .find((value) => (typeof value === "string" && value.trim()) || typeof value === "number")
      : page;
    if (typeof label !== "string" && typeof label !== "number") return [];
    const text = String(label).trim();
    if (!text || seen.has(text)) return [];
    seen.add(text);
    return [{ key: text, label: text }];
  });
};
