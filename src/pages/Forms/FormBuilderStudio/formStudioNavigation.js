export const formStudioPath = (formDefinitionId) => {
  const id = Number(formDefinitionId);
  return Number.isInteger(id) && id > 0 ? `/forms/${id}/studio` : null;
};

export const openFormStudio = (navigate, formDefinitionId, currentPath = "") => {
  const target = formStudioPath(formDefinitionId);
  if (!target || typeof navigate !== "function") return false;
  if (currentPath === target) return true;
  navigate(target);
  return true;
};
