import { useMemo } from "react";
import { useProductDocumentTreeById } from "@/QueryServises/productDocumentQuery/index.js";
import { canViewEditionFromTree, editionAccessIndex } from "@/Services/productDocuments/fileAccess";

export default function useDocumentFileAccess(productId, enabled = true) {
  const active = Boolean(enabled && productId);
  const query = useProductDocumentTreeById(productId, {
    enabled: active,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
  const ready = active && query.isSuccess && !query.isFetching;
  const index = useMemo(() => editionAccessIndex(query.data), [query.data]);
  const canViewEdition = useMemo(() => (editionId, state, surveyDate) =>
    canViewEditionFromTree(index, ready, editionId, state, surveyDate), [index, ready]);
  return { canViewEdition, ready, index, query };
}
