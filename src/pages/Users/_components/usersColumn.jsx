import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Image } from "antd";
import { BASEURL } from "../../../Services/axiosInstance";


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
  // {
  //   title: "مدیر",
  //   dataIndex: "is_superuser",
  //   key: "is_superuser",
  //   render: (is_superuser) => (is_superuser ? "بله" : "خیر"),
  // },
  {
    title: "مدیرسیستم",
    dataIndex: "is_superuser",
    key: "is_superuser",
    render: (is_superuser) => (is_superuser ? "بله" : "خیر"),
  },
  {
    title: "مدیرعامل",
    dataIndex: "is_staff",
    key: "is_staff",
    render: (is_staff) => (is_staff ? "بله" : "خیر"),
  },
  {
    title: "امضا کاربر",
    dataIndex: "signature_image",
    key: "signature_image",
    render: (_, record) =>
      record.signature_image ? (
        <Image
          width={70}
          height={50}
          src={`${BASEURL.replace("/api/v1", "")}${record.signature_image}`}
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
          src={`${BASEURL.replace("/api/v1", "")}${record.temp_image}`}
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
          size="small"
          type="text"
          title="ویرایش"
          className="text-green-600 border-green-600"
          icon={<EditOutlined className="text-green-600" />}
          onClick={() => handleEditUser(record)}
        />
        <Button
          size="small"
          type="text"
          title="حذف"
          className="text-red-600 border-red-600"
          icon={<DeleteOutlined className="text-red-600" />}
          onClick={() => handleDeleteUser(record)}
        />
      </div>
    ),
  },
];