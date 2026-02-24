import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios";

export const useLazyProductTreeSelect = (initialData = []) => {
  const queryClient = useQueryClient();
  const { myAxios } = useMyAxios();
  const [treeData, setTreeData] = useState([]);

  const mapNode = (item) => ({
    title: item.persian_title || item.title || item.name || "بدون عنوان",
    value: item.id,
    key: item.id,
    id: item.id,
    isLeaf: !item.has_children,
    children:
      item.children?.length > 0 ? item.children.map(mapNode) : undefined,
  });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setTreeData(initialData.map(mapNode));
    }
  }, [initialData]);

  const updateNodes = (list, key, children) =>
    list.map((node) => {
      if (node.key === key) return { ...node, children };
      if (node.children)
        return { ...node, children: updateNodes(node.children, key, children) };
      return node;
    });

  const loadChildren = async (node) => {
    const { key, id } = node;

    if (node.children && node.children.length > 0) return;

    const data = await queryClient.fetchQuery({
      queryKey: ["product-children", id],
      queryFn: () =>
        myAxios
          .get(`/product/get-product-child-by-id/${id}`)
          .then((res) => res.data),
    });

    const children = data.map(mapNode);
    setTreeData((prev) => updateNodes(prev, key, children));
  };

  return { treeData, loadChildren };
};
