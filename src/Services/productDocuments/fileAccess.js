// Only the edition-specific API value is a permission. Never decode a JWT here.
export const canViewUnacceptedVersion = (editionOrFlag) =>
  (editionOrFlag && typeof editionOrFlag === "object"
    ? editionOrFlag.can_view_unaccepted_version
    : editionOrFlag) === true;

// Preserve the previous accepted-state and review-date rules.
export const canViewDocumentFiles = (state, editionOrFlag, surveyDate) => {
  const hasUnacceptedAccess = canViewUnacceptedVersion(editionOrFlag);
  const reviewDate = surveyDate ? new Date(surveyDate) : null;
  const today = new Date();
  reviewDate?.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (reviewDate && reviewDate < today && !hasUnacceptedAccess) return false;
  return Number(state) === 40 || hasUnacceptedAccess;
};

export const editionAccessIndex = (payload) => {
  const index = new Map();
  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((node) => {
      (Array.isArray(node?.product_document?.edition) ? node.product_document.edition : []).forEach((edition) => {
        if (edition?.id != null) index.set(String(edition.id), edition);
      });
      walk(node?.children);
    });
  };
  walk(Array.isArray(payload) ? payload : payload?.results);
  return index;
};

export const canViewEditionFromTree = (index, ready, editionId, state, surveyDate) => {
  if (!ready || editionId == null) return false;
  const edition = index.get(String(editionId));
  return Boolean(edition) && canViewDocumentFiles(state, edition, surveyDate);
};
