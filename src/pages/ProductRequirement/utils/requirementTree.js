// Pure API -> UI adapter. No React or requests here: easy to edit and test.
const asArray = (value) => Array.isArray(value) ? value : [];
const normalizeText = (value) => String(value ?? "")
  .toLocaleLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").trim();

export function buildRequirementTree(data) {
  const visitCategory = (category, parentPath = "") => {
    const key = `${parentPath}/category-${category.id}`;
    const requirements = asArray(category.product_requirements).map((requirement) => {
      const requirementKey = `${key}/requirement-${requirement.id}`;
      return {
        key: requirementKey,
        kind: "requirement",
        label: requirement.title || "الزام بدون عنوان",
        code: "",
        category,
        requirement,
        children: asArray(requirement.editions).map((edition) => ({
          key: `${requirementKey}/edition-${edition.id}`,
          kind: "edition",
          label: edition.full_code || edition.code || `نسخه ${edition.id}`,
          code: edition.code || "",
          category,
          requirement,
          edition,
          children: [],
          isLeaf: true,
        })),
      };
    });
    return {
      key,
      kind: "category",
      label: category.title || category.persian_title || category.english_title || "بدون عنوان",
      code: category.code || "",
      category,
      // Keep category order and every requirement/edition; never use only [0].
      children: [...requirements, ...asArray(category.children).map((child) => visitCategory(child, key))],
    };
  };
  const roots = Array.isArray(data) ? data : data && typeof data === "object" ? [data] : [];
  return roots.map((category) => visitCategory(category));
}

export function filterRequirementTree(nodes, query) {
  const term = normalizeText(query);
  if (!term) return nodes;
  return nodes.flatMap((node) => {
    const ownText = [node.label, node.code, node.category?.english_title,
      node.kind === "edition" ? node.edition?.description : ""].join(" ");
    if (normalizeText(ownText).includes(term)) return [node];
    const children = filterRequirementTree(node.children, term);
    return children.length ? [{ ...node, children }] : [];
  });
}

export function getBranchKeys(nodes) {
  return nodes.flatMap((node) => node.children.length
    ? [node.key, ...getBranchKeys(node.children)] : []);
}

export function countRequirements(nodes) {
  return nodes.reduce((count, node) => count + (node.kind === "requirement" ? 1 : 0)
    + countRequirements(node.children), 0);
}

// State names are not specified by the API contract. Show raw codes, not guessed labels.
// Add confirmed backend labels here later: 10: { label: "...", color: "..." }.
export const REQUIREMENT_STATES = {};
export function getRequirementState(state) {
  return REQUIREMENT_STATES[state] || {
    label: state == null ? "وضعیت نامشخص" : `وضعیت ${state}`,
    color: "default",
  };
}
