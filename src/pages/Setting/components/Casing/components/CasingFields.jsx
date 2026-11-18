import { Form, Input } from "antd";

export default function CasingFields() {
  return (
    <>
      <Form.Item name="english_name" label="نام انگلیسی">
        <Input dir="ltr" maxLength={255} />
      </Form.Item>
      <Form.Item name="symbol" label="کد اختصاری">
        <Input dir="auto" maxLength={255} />
      </Form.Item>
    </>
  );
}
