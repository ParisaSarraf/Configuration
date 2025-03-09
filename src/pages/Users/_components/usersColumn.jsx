import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Image } from "antd";
import { BASEURL } from "../../../utils/Api";

const BaseUrl = BASEURL;

export const columns = (handleEditUser, handleDeleteUser) => [
  {
    title: "نام کاربری",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "نام",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "نام خانوادگی",
    dataIndex: "last_name",
    key: "last_name",
  },
  {
    title: "شماره تلفن",
    dataIndex: "phone_number",
    key: "phone_number",
    sorter: (a, b) => a.phone_number - b.phone_number,
  },
  {
    title: "کد ملی",
    dataIndex: "national_code",
    key: "national_code",
    sorter: (a, b) => a.national_code - b.national_code,
  },
  {
    title: "مدیر",
    dataIndex: "is_superuser",
    key: "is_superuser",
    render: (is_superuser) => (is_superuser ? "بله" : "خیر"),
  },
//   {
//     title: "کارکنان",
//     dataIndex: "is_staff",
//     key: "is_staff",
//     render: (is_staff) => (is_staff ? "بله" : "خیر"),
//   },
  {
    title: "امضا کاربر",
    dataIndex: "signature_image",
    key: "signature_image",
    render: (_, record) =>
      record.signature_image ? (
        <Image
          width={70}
          height={50}
          src={`${BaseUrl.replace("/api/v1", "")}${record.signature_image}`}
          alt="امضا کاربر"
        />
      ) : (
        "تصویری وجود ندارد"
      ),
  },
  {
    title: "تصویر کاربر",
    dataIndex: "temp_image",
    key: "temp_image",
    render: (_, record) =>
      record.temp_image ? (
        <Image
          width={70}
          height={50}
          src={`${BaseUrl.replace("/api/v1", "")}${record.temp_image}`}
          alt="تصویر کاربر"
        />
      ) : (
        "تصویری وجود ندارد"
      ),
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
          onClick={() => handleEditUser(record)}
        />
        <Button
          type="text"
          title="حذف"
          icon={<DeleteOutlined className="text-red-600" />}
          onClick={() => handleDeleteUser(record)}
        />
      </div>
    ),
  },
];