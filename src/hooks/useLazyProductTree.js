import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios";
import { useChildProductByIdKey } from "@/QueryServises/productQuery";
import { mapProductToTreeNode } from "../utils/mapProductToTreeNode";

export const useLazyProductTree = (initialData = []) => {
  const queryClient = useQueryClient();
  const { myAxios } = useMyAxios();

  const [treeData, setTreeData] = useState(initialData);

  useEffect(() => {
    setTreeData(initialData);
  }, [initialData]);

  const updateTreeData = (list, key, children) =>
    list.map((node) => {
      if (!node) return null;
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    }).filter(Boolean);

  const loadChildren = async (node) => {
    const { key, id, children } = node;
    if (children?.length) return;

    const data = await queryClient.fetchQuery({
      queryKey: useChildProductByIdKey(id),
      queryFn: () =>
        myAxios
          .get(`/product/get-product-child-by-id/${id}`)
          .then((res) => res.data),
      staleTime: Infinity,
    });

    const mappedChildren = data.map(item => mapProductToTreeNode(item)).filter(Boolean);

    setTreeData((prev) => updateTreeData(prev, key, mappedChildren));
  };

  return { treeData, loadChildren };
};