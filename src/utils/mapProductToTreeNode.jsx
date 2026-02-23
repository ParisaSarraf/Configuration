import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export const mapProductToTreeNode = (item, showHidden = false) => {
  // اگر showHidden = false و آیتم مخفی است، null برگردان
  if (!showHidden && item.hide) return null;

  return {
    title: (
      <div className="flex items-center">
        <FiberManualRecordIcon
          fontSize="small"
          color={
            item.status === "active"
              ? "success"
              : item.status === "inactive"
              ? "error"
              : "warning"
          }
        />
        <span>
          {item.persian_title} ({item.final_code || item.code})
        </span>
      </div>
    ),
    key: `product-${item.id}`,
    id: item.id,
    value: item.id,
    isLeaf: !item.has_children,
    style: item.hide ? { opacity: 0.5 } : {},
    children: item.children
      ?.map((child) => mapProductToTreeNode(child, showHidden))
      .filter(Boolean), 
    productData: item,
  };
};