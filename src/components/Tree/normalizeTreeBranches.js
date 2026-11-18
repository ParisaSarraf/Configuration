export function normalizeTreeBranches(nodes, hasLoadData, childrenField = "children") {
  return (nodes ?? []).map((node) => {
    const children = node[childrenField];
    const childrenLoaded = Array.isArray(children);
    const mayHaveChildren = node.isLeaf === false ||
      (node.isLeaf == null && node.has_children === true);
    const canLoadChildren = hasLoadData && !childrenLoaded && mayHaveChildren;
    const hasChildren = childrenLoaded && children.length > 0;

    return {
      ...node,
      [childrenField]: childrenLoaded
        ? normalizeTreeBranches(children, hasLoadData, childrenField)
        : children,
      isLeaf: !(hasChildren || canLoadChildren),
    };
  });
}
