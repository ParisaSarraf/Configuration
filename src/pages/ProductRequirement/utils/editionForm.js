const asArray = (value) => Array.isArray(value) ? value : [];

// Display category and requirement rows even if they have no editions.
// Only edition rows are selectable: the API expects an edition id, not a requirement id.
export function getSourceEditionOptions(data) {
  const options = [];
  const seenEditions = new Set();
  const visit = (category, parents = [], path = "root") => {
    if (!category || typeof category !== "object") return;
    const name = category.title || category.persian_title || category.english_title || "دسته بدون عنوان";
    const categoryLabel = category.code ? `${name} (${category.code})` : name;
    const categoryPath = [...parents, categoryLabel];
    const categorySearch = [...categoryPath, category.english_title].filter(Boolean).join(" ");
    options.push({ value: `category:${path}`, label: `دسته: ${categoryPath.join(" / ")}`, searchText: categorySearch, disabled: true });
    asArray(category.product_requirements).forEach((requirement, reqIndex) => {
      if (!requirement || typeof requirement !== "object") return;
      const title = requirement.title || "الزام بدون عنوان";
      const editions = asArray(requirement.editions);
      const reqSearch = [categorySearch, title].join(" ");
      options.push({
        value: `requirement:${path}:${reqIndex}`,
        label: `الزام: ${title}${editions.length ? "" : " — بدون نسخه"}`,
        searchText: reqSearch,
        disabled: true,
      });
      editions.forEach((edition) => {
        if (edition?.id == null || seenEditions.has(String(edition.id))) return;
        seenEditions.add(String(edition.id));
        const editionLabel = edition.full_code || edition.code || `نسخه ${edition.id}`;
        options.push({ value: edition.id, label: `نسخه: ${editionLabel} — ${title}`,
          searchText: [reqSearch, editionLabel, edition.code, edition.description].filter(Boolean).join(" ") });
      });
    });
    asArray(category.children).forEach((child, index) => visit(child, categoryPath, `${path}.${index}`));
  };
  (Array.isArray(data) ? data : data ? [data] : []).forEach((category, index) => visit(category, [], String(index)));
  return options;
}

export function normalizeEditionSearch(value) {
  return String(value ?? "").toLocaleLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
}

export function buildEditionFormData(productRequirementId, values) {
  if (productRequirementId == null || productRequirementId === "") {
    throw new Error("الزام محصول انتخاب نشده است");
  }
  const data = new FormData();
  data.append("product_requirement_id", String(productRequirementId));
  for (const name of ["trustee_id", "source_requirement_edition_id", "code", "reason", "description", "file_description"]) {
    const value = values[name];
    if (value !== undefined && value !== null && value !== "") data.append(name, String(value));
  }
  const file = values.file?.[0]?.originFileObj;
  if (file) data.append("file", file);
  return data;
}
