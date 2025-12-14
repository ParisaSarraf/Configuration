import { Button, Space, Tag } from "antd";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import { DeleteOutlined, PoweroffOutlined } from "@ant-design/icons";

const ListOfRequestOfWareHouseMadeCol = (handleDelete) => {
  return [
    {
      title: "نام محصول",
      dataIndex: ["warehouse_request_numbers", 0, "product", "persian_title"],
      key: "persian_title",
    },
    {
      title: "کد محصول",
      key: "code",
      dataIndex: ["warehouse_request_numbers", 0, "product", "code"],
      render: (record) => {
        return <Tag color={"purple"}>{record}</Tag>;
      },
    },
    {
      title: "نوع خرید",
      dataIndex: "request_type",
      key: "request_type",
      render: (record) => {
        return (
          <Tag color={record === "assembly" ? "blue" : "gold"}>
            {record === "assembly" ? "مونتاژ" : "ساخت"}
          </Tag>
        );
      },
    },
    {
      title: "تعداد",
      dataIndex: ["warehouse_request_numbers", 0, "confirmed_number"],
      key: "confirmed_number",
      render: (text) => text || "ندارد",
    },
    {
      title: "درصد مونتاژ",
      dataIndex: "charge_percentage",
      key: "charge_percentage",
      render: (text) => text || "ندارد",
    },
    {
      title: "تعداد پشتیبانی",
      dataIndex: "support_number",
      key: "support_number",
      render: (text) => text || "ندارد",
    },
    {
      title: "تعداد کل",
      dataIndex: "total_number",
      key: "total_number",
      render: (text) => text || "ندارد",
    },
    {
      title: "تاریخ درخواست",
      dataIndex: "date",
      key: "date",
      render: (text) => {
        return (
          <Tag color={"green"}>{georgianDateToJalaliDate(text) || "ندارد"}</Tag>
        );
      },
    },
    {
      title: "تاریخ تایید",
      dataIndex: "total_number",
      key: "total_number",
      render: (text) => {
        return (
          <Tag color={"green"}>{georgianDateToJalaliDate(text) || "ندارد"}</Tag>
        );
      },
    },
    {
      title: "توضیح اکسل",
      dataIndex: "total_number",
      key: "total_number",
      render: (text) => {
        return (
          <Tag color={"green"}>{georgianDateToJalaliDate(text) || "ندارد"}</Tag>
        );
      },
    },
    {
      title: "عملیات",
      key: "actions",
      render: (record) => {
        return (
          <Space>
            <Button
              title={"حذف"}
              danger
              onClick={() => handleDelete(record)}
              icon={<DeleteOutlined />}
            />
            <Button
              title={"غیرفعال"}
              // danger
              // onClick={() => handleDelete(record)}
              icon={<PoweroffOutlined />}
            />
          </Space>
        );
      },
    },
  ];
};

export default ListOfRequestOfWareHouseMadeCol;
