import { Form, Input, Tag } from "antd";

const RequestOfWarehouseCol = () => {
  return [
    {
      title: "عنوان محصول",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "کد محصول",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
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
      render: (text) => text || "ندارد",
    },
    {
      title: "تعداد مورد تایید",
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
  ];
};

export default RequestOfWarehouseCol;
