import { Col, Form, Input, InputNumber, Checkbox, message, Row } from "antd";
import Modal from "../../../components/Modal";
import { useFormApiMutations } from "../../../QueryServises/formsQuery";

const FormCategoryModal = ({ isOpen, closeModal, modalData }) => {
  const mutations = useFormApiMutations();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await mutations.category(values);
      message.success("باموفقیت دسته بندی جدید اضافه شد.");
      closeModal();
    } catch (error) {
      console.error(error);
      message.error("مشکلی در ایجاد دسته بندی پیش آمده است");
    }
  };

  return (
    <Modal size={500} isOpen={isOpen} onClose={closeModal}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="name" label="نام">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="slug" label="اسلاگ">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="order" label="ترتیب">
              <InputNumber className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="icon" label="آیکون">
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="توضیحات">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="allowed_groups" label="گروه‌های مجاز">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12} className="flex items-center">
            <Form.Item
              name="is_collapsed_by_default"
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox>پیش‌فرض بسته شده</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormCategoryModal;
