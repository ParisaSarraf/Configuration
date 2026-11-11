// The full description is submitted as "reason"; older/tree responses may only
// provide "description". Keep both when the server returns distinct values.
export function getRequirementDescription(value) {
  const parts = [value?.reason, value?.description]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim());
  return [...new Set(parts)].join(" — ");
}
