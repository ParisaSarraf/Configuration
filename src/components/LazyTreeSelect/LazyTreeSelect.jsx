import { TreeSelect } from "antd";

const TsLazy = ({ treeData, loadData, value, onChange, placeholder, ...rest }) => {
  return (
    <TreeSelect
      treeData={treeData}
      loadData={loadData}
      value={value}
      onChange={onChange}
      placeholder={placeholder || "انتخاب کنید"}
      style={{ width: "100%" }}
      treeDefaultExpandAll={false}
      allowClear
      showSearch
      filterTreeNode={(input, node) => 
        node.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...rest}
    />
  );
};

export default TsLazy;