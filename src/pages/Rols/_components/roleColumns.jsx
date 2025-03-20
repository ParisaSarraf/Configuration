// import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
// import { Button, Image } from "antd";
import { Button } from "antd";
import { BASEURL } from "../../../utils/Api";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const BaseUrl = BASEURL;

export const roleColumns = (handleEditRole, handleDeleteRole) => [
  // export const roleColumns = () => [
  {
    title: "نام",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "دسترسی ها",
    dataIndex: "permissions",
    key: "name",
  },
  {
    title: "عملیات",
    key: "actions",
    render: (_, record) => (
      <div className="flex gap-2">
        <Button
          type="text"
          title="ویرایش"
          icon={<EditOutlined className="text-green-600" />}
          onClick={() => handleEditRole(record)}
        />
        <Button
          type="text"
          title="حذف"
          icon={<DeleteOutlined className="text-red-600" />}
          onClick={() => handleDeleteRole(record)}
        />
      </div>
    ),
  },
];