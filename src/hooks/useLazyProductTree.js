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
    list
      .map((node) => {
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
      })
      .filter(Boolean);

  const fetchAndSetChildren = async (id, key) => {
    const data = await queryClient.fetchQuery({
      queryKey: useChildProductByIdKey(id),
      queryFn: () =>
        myAxios
          .get(`/product/get-product-child-by-id/${id}`)
          .then((res) => res.data),
      staleTime: Infinity,
    });

    const mappedChildren = data
      .map((item) => mapProductToTreeNode(item))
      .filter(Boolean);
    setTreeData((prev) => updateTreeData(prev, key, mappedChildren));
    return mappedChildren;
  };

  const loadChildren = async (node) => {
    const { key, id, children } = node;
    if (children?.length) return;
    await fetchAndSetChildren(id, key);
  };


  const expandToPath = async (idPath) => {
    if (!Array.isArray(idPath) || idPath.length === 0) {
      return { expandedKeys: [], targetKey: null, targetNode: null };
    }

    const expandedKeys = [];
    let siblingsAtLevel = treeData; 
    let targetNode = null;

    for (let i = 0; i < idPath.length; i++) {
      const id = idPath[i];
      const key = String(id);
      const isLast = i === idPath.length - 1;

      const node = siblingsAtLevel?.find((n) => n?.id === id);

      if (isLast) {
        targetNode = node ?? null;
        break;
      }

      expandedKeys.push(key);

      const children = node?.children?.length
        ? node.children
        : await fetchAndSetChildren(id, key);

      siblingsAtLevel = children;
    }

    return {
      expandedKeys,
      targetKey: String(idPath[idPath.length - 1]),
      targetNode,
    };
  };

  return { treeData, loadChildren, expandToPath };
};
