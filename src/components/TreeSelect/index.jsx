import { TreeSelect } from "antd";
import { useState, useMemo } from "react";
import { useLazyProductTree } from "@/hooks/useLazyProductTree";
import { mapProductToTreeNode } from "../../utils/mapProductToTreeNode";

const TS = ({
  data = [],
  placeholder = "لطفا انتخاب کنید",
  allowClear = true,
  treeIcon = true,
  treeLine = true,
  showSearch = true,
  value,
  onChange,
  labelInValue = false,
  treeCheckable = false,
  modalMode,
  modalData,
  lazy = false,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const lazyTree = useLazyProductTree(data);

  const getTreeSelectOptions = (items = []) =>
    items.map((item) => {
      const node = mapProductToTreeNode(item);
      if (!node) return null;

      return {
        ...node,
        key: node.key, 
        disabled: modalMode === "edit" && item.id === modalData?.id,
      };
    }).filter(Boolean);

  const treeData = useMemo(() => {
    if (lazy) {
      // در حالت لزی، مستقیم از دیتای هوک استفاده کن (چون قبلا مپ شده است)
      return lazyTree.treeData;
    }
    return getTreeSelectOptions(data);
  }, [lazy, data, lazyTree.treeData]);

  return (
    <TreeSelect
      style={{ width: "100%" }}
      treeData={treeData}
      placeholder={placeholder}
      allowClear={allowClear}
      treeIcon={treeIcon}
      treeLine={treeLine}
      showSearch={showSearch}
      treeCheckable={treeCheckable}
      labelInValue={labelInValue}
      value={value}
      onChange={onChange}
      loadData={lazy ? lazyTree.loadChildren : undefined}
      searchValue={searchValue}
      onSearch={setSearchValue}
      treeNodeFilterProp="searchText"
      maxTagCount="responsive"
      filterTreeNode={(input, node) =>
        String(node.searchText || "").toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

export default TS;