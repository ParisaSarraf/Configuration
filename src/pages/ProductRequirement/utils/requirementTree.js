// Pure API -> UI adapter. No React or requests here: easy to edit and test.
const asArray = (value) => Array.isArray(value) ? value : [];
const normalizeText = (value) => String(value ?? "")
  .toLocaleLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").trim();

// Imported requirements belong to another product and must not be deleted here.
export function canDeleteRequirement(requirement) {
  return requirement?.id != null && requirement.imported !== true;
}

// An imported edition cannot be re-exported. A source edition must have
// reached approval (20) or a later known stage before it can be exported.
export function canExportRequirementEdition(requirement, edition) {
  return edition?.id != null && requirement?.imported !== true
    && [20, 30, 40, 50].includes(Number(edition?.state));
}

export function canAddRequirementEdition(requirement) {
  return requirement?.id != null && requirement.imported !== true;
}

// A requirement or category is not an edition and must never be sent to
// the edition-specific acceptor endpoint.
export function getSelectedEdition(node, selected) {
  if (!selected || node?.kind !== "edition" || node.edition?.id == null) return null;
  return { id: node.edition.id, full_code: node.edition.full_code, code: node.edition.code };
}

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
          // "imported" is on the requirement, but assignments identify which edition reached this product.
          isImported: requirement.imported === true && asArray(edition.assigned_to)
            .some((assignment) => assignment?.is_current_product === true),
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

// Workflow labels supplied for product requirement editions and assignments.
export const REQUIREMENT_STATES = {
  10: { label: "تهیه", color: "#f5222d" },
  20: { label: "تایید", color: "#fa8c16" },
  30: { label: "اجرا", color: "#1677ff" },
  40: { label: "تصویب", color: "#722ed1" },
  50: { label: "صحه‌گذاری", color: "#52c41a" },
};
export function getRequirementState(state) {
  return REQUIREMENT_STATES[state] || {
    label: state == null ? "وضعیت نامشخص" : `وضعیت ${state}`,
    color: "default",
  };
}

// Assignment state codes are distinct from the source edition's five stages.
export function getAssignmentState(state) {
  const states = {
    10: { label: "اجرا", color: "#1677ff" },
    20: { label: "تصویب", color: "#722ed1" },
    30: { label: "صحه‌گذاری", color: "#52c41a" },
  };
  return states[state] || { label: state == null ? "وضعیت نامشخص" : `وضعیت ${state}`, color: "default" };
}
