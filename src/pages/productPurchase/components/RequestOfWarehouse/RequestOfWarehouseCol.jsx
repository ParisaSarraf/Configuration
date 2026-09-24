import { Form, Input, Tag } from "antd";

const RequestOfWarehouseCol = () => {
  return [
    {
      title: "عنوان محصول",
      dataIndex: "name",
      key: "name",
      width: 170,
      ellipsis: true,
    },
    {
      title: "کد محصول",
      dataIndex: "code",
      key: "code",
      width: 120,
      ellipsis: true,
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status === "active" ? "فعال" : "غیرفعال"}
        </Tag>
      ),
    },
    {
      title: "تعداد کل",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      render: (text) => text || "ندارد",
    },
    {
      title: "تعداد مورد تایید",
      width: 150,
      render: (_, record) => (
        <Form.Item
          name={["confirmed_number", record.id]}
          initialValue={record.quantity}
          className="mb-0"
          rules={[
            {
              validator: (_, value) => {
                if (value && value < 0) {
                  return Promise.reject("تعداد نمی‌تواند منفی باشد");
                }
                if (!/^\d+(\.\d+)?$/.test(value)) {
                  return Promise.reject("لطفا فقط عدد وارد کنید");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            min={0}
            placeholder={record.status === "active" ? "تعداد را وارد کنید" : "غیرفعال"}
            step="0.01"
            disabled={record.status !== "active"}
          />
        </Form.Item>
      ),
    },
    {
      title: "توضیحات",
      key: "export_description",
      width: 220,
      render: (_, record) => (
        <Form.Item
          name={["export_description", record.id]}
          className="mb-0"
        >
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 3 }}
            maxLength={1000}
            allowClear
            placeholder={
              record.status === "active"
                ? "توضیحات این ردیف را وارد کنید"
                : "غیرفعال"
            }
            disabled={record.status !== "active"}
          />
        </Form.Item>
      ),
    },
  ];
};

export default RequestOfWarehouseCol;
