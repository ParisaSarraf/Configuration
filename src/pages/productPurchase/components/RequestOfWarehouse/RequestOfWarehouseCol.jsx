import { Form, Input, Tag } from "antd";
import { isActivePurchaseProduct } from "./purchaseProductStatus";

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
        <Tag color={isActivePurchaseProduct({ status }) ? "green" : "default"}>
          {isActivePurchaseProduct({ status }) ? "فعال" : "غیرفعال"}
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
          initialValue={isActivePurchaseProduct(record) ? record.quantity : undefined}
          className="mb-0"
          rules={isActivePurchaseProduct(record) ? [
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
          ] : []}
        >
          <Input
            type="number"
            min={0}
            placeholder={isActivePurchaseProduct(record) ? "تعداد را وارد کنید" : "غیرفعال"}
            step="0.01"
            disabled={!isActivePurchaseProduct(record)}
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
              isActivePurchaseProduct(record)
                ? "توضیحات این ردیف را وارد کنید"
                : "غیرفعال"
            }
            disabled={!isActivePurchaseProduct(record)}
          />
        </Form.Item>
      ),
    },
  ];
};

export default RequestOfWarehouseCol;
