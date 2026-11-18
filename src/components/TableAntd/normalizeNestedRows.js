export function normalizeNestedRows(rows) {
  if (!Array.isArray(rows)) return rows;

  return rows.map((row) => {
    if (!Array.isArray(row.children)) return row;

    return {
      ...row,
      children: row.children.length ? normalizeNestedRows(row.children) : undefined,
    };
  });
}
