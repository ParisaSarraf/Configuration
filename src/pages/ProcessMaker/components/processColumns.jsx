import { Button, Tag, Tooltip } from "antd";
import { EyeOutlined, PartitionOutlined } from "@ant-design/icons";

const processColumns = ({ page, pageSize = 8, onViewRequests }) => [
 {
 title: "ردیف",
 key: "index",
 width: 72,
 align: "center",
 render: (_value, _record, index) => (page - 1) * pageSize + index + 1,
 },
 {
 title: "نام فرآیند",
 dataIndex: "name",
 key: "name",
 render: (value, record) => (
 <div className="flex flex-col">
 <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 ">
 <PartitionOutlined className="text-slate-400" />
 {value || "بدون نام"}
 </span>
 {record?.description ? (
 <span className="text-xs text-slate-500 ">
 {record.description}
 </span>
 ) : null}
 </div>
 ),
 },
 {
 title: "شناسه فرآیند",
 dataIndex: "id",
 key: "id",
 width: 130,
 align: "center",
 render: (value) => <Tag color="blue">#{value ?? "—"}</Tag>,
 },
 {
 title: "فرم مرتبط",
 key: "form_definition",
 width: 140,
 align: "center",
 render: (_value, record) => {
 const formId =
 typeof record?.form_definition === "object"
 ? record.form_definition?.id
 : record?.form_definition;
 return formId ? <Tag color="geekblue">فرم #{formId}</Tag> : "—";
 },
 },
 {
 title: "عملیات",
 key: "operations",
 width: 220,
 align: "center",
 render: (_value, record) => (
 <Tooltip title="دریافت و نمایش درخواست‌های این فرآیند">
 <Button
 type="primary"
 icon={<EyeOutlined />}
 onClick={() => onViewRequests?.(record)}
 >
 مشاهده درخواست‌ها
 </Button>
 </Tooltip>
 ),
 },
];

export default processColumns;
