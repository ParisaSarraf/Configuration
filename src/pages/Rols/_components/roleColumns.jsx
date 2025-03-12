// import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
// import { Button, Image } from "antd";
import { BASEURL } from "../../../utils/Api";

const BaseUrl = BASEURL;

// export const roleColumns = (handleEditUser, handleDeleteUser) => [
export const roleColumns = () => [
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
  // {
  //   title: "عملیات",
  //   key: "actions",
  //   render: (_, record) => (
  //     <div className="flex gap-2">
  //       <Button
  //         type="text"
  //         title="ویرایش"
  //         icon={<EditOutlined className="text-green-600" />}
  //         onClick={() => handleEditUser(record)}
  //       />
  //       <Button
  //         type="text"
  //         title="حذف"
  //         icon={<DeleteOutlined className="text-red-600" />}
  //         onClick={() => handleDeleteUser(record)}
  //       />
  //     </div>
  //   ),
  // },
];