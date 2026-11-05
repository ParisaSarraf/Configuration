// Values are workflow states; changing step sends the destination state.
export const REQUIREMENT_WORKFLOW_STEPS = [
  { value: 10, label: "تهیه" },
  { value: 20, label: "تایید" },
  { value: 30, label: "اجرا" },
  { value: 40, label: "تصویب" },
  { value: 50, label: "صحه‌گذاری" },
];

export function canRunRequirementWorkflow(requirement, edition) {
  return requirement?.imported === false && edition?.id != null;
}

export function getWorkflowIndex(state) {
  if (state == null || state === "") return -1;
  return REQUIREMENT_WORKFLOW_STEPS.findIndex((step) => step.value === Number(state));
}

// Only a known complete list can establish whether exported assignments are done.
// An empty list means this edition has not been exported and is not blocked.
export function allAssignmentsCompleted(edition) {
  return Array.isArray(edition?.assigned_to) && edition.assigned_to.every(
    (item) => item?.state != null && item.state !== "" && Number(item.state) === 30
  );
}

export function findEditionInTree(data, requirementId, editionId) {
  const categories = Array.isArray(data) ? data : data && typeof data === "object" ? [data] : [];
  for (const category of categories) {
    for (const requirement of Array.isArray(category?.product_requirements) ? category.product_requirements : []) {
      if (String(requirement?.id) !== String(requirementId)) continue;
      const edition = (Array.isArray(requirement.editions) ? requirement.editions : []).find((item) => String(item?.id) === String(editionId));
      if (edition) return { requirement, edition };
    }
    const found = findEditionInTree(category?.children, requirementId, editionId);
    if (found) return found;
  }
  return null;
}

export function buildRequirementTransition(requirement, edition, currentState, direction, comment) {
  if (!canRunRequirementWorkflow(requirement, edition)) throw new Error("روال فقط برای الزام غیرایمپورت‌شده در دسترس است");
  const currentIndex = getWorkflowIndex(currentState);
  if (currentIndex < 0 || ![-1, 1].includes(direction)) throw new Error("وضعیت یا جهت روال معتبر نیست");
  const target = REQUIREMENT_WORKFLOW_STEPS[currentIndex + direction];
  if (!target) throw new Error("امکان انتقال به این مرحله وجود ندارد");
  if (target.value === 30 && !allAssignmentsCompleted(edition)) throw new Error("برای انتقال به اجرا، وضعیت همه تخصیص‌ها باید به صحه‌گذاری (۳۰) رسیده باشد.");
  if (!String(comment ?? "").trim()) throw new Error("لطفاً توضیح مرحله را وارد کنید");
  return { id: edition.id, state: target.value, comment: String(comment).trim() };
}
