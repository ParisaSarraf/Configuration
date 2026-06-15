import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export const mapProductToTreeNode = (item, showHidden = false) => {
  if (!showHidden && item.hide) return null;
  const node = {
    title: (
      <div className="flex items-center -mr-4">
        <FiberManualRecordIcon
          fontSize="small"
          color={
            item.status === "active"
              ? "success"
              : item.status === "inactive"
                ? "error"
                : item.status === null
                  ? "disabled"
                  : "warning"
          }
        />
        <span>
          {item.persian_title} ({item.final_code || item.code})
        </span>
      </div>
    ),
    key: String(item.id),
    value: item.id,
    id: item.id,
    isLeaf: !item.has_children,
    searchText: `${item.persian_title} ${item.code}`,
    productData: item,
  };
  if (item.children && item.children.length > 0) {
    node.children = item.children
      .map((child) => mapProductToTreeNode(child, showHidden))
      .filter(Boolean);
  } else if (item.has_children) {
    node.children = undefined;
  }

  return node;
};
