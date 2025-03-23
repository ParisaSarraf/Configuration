import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button } from "antd";

export const roleColumns = (handleEditRole, handleDeleteRole) => [
  {
    title: "نام",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "دسترسی",
    dataIndex: "permissions",
    key: "permissions",
    render: (permissions) => permissions.map((p) => p.name).join(", "),
  },
  {
    title: "عملیات",
    key: "actions",
    render: (_, record) => (
      <div className="flex flex-row ">
        <Button type="text" className="text-green-600" onClick={() => handleEditRole(record)} icon={<EditOutlined />}/>
        <Button type="text" className="text-red-600" onClick={() => handleDeleteRole(record)} icon={<DeleteOutlined />} />
      </div>
    ),
  },
];