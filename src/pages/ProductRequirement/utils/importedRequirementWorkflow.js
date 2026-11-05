export const IMPORTED_WORKFLOW_STEPS = [
  { value: 10, label: "اجرا" },
  { value: 20, label: "تصویب" },
  { value: 30, label: "صحه‌گذاری" },
];

export function getCurrentProductAssignments(edition) {
  return (Array.isArray(edition?.assigned_to) ? edition.assigned_to : [])
    .filter((item) => item?.is_current_product === true && item?.id != null);
}

export function getImportedWorkflowIndex(state) {
  if (state == null || state === "") return -1;
  return IMPORTED_WORKFLOW_STEPS.findIndex((step) => step.value === Number(state));
}

export function getImportedTransitionTarget(state, direction) {
  if (state == null || state === "" || ![-1, 1].includes(direction)) return null;
  const index = getImportedWorkflowIndex(state);
  return index < 0 ? null : IMPORTED_WORKFLOW_STEPS[index + direction] || null;
}

export function buildImportedTransition(requirement, assignment, direction, comment) {
  if (requirement?.imported !== true || assignment?.is_current_product !== true || assignment?.id == null) {
    throw new Error("تخصیص معتبر محصول جاری انتخاب نشده است");
  }
  const target = getImportedTransitionTarget(assignment.state, direction);
  if (!target) throw new Error("امکان انتقال به این مرحله وجود ندارد");
  if (!String(comment ?? "").trim()) throw new Error("لطفاً توضیح مرحله را وارد کنید");
  return { id: assignment.id, state: target.value, comment: String(comment).trim() };
}
