import { Col, Form, Input, InputNumber, Checkbox, message, Row } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../../components/Modal";

import { useEffect } from "react";
import { useCreateFormCategory } from "../../../QueryServises/formsQuery";

const FormCategoryModal = ({
  isOpen,
  closeModal,
  modalMode,
  modalData,
  refetch,
}) => {
  const [form] = Form.useForm();
  const { mutateAsync: createCategory } = useCreateFormCategory();

  const onFinish = async (values) => {
    try {
      const processedValues = {
        ...values,
        allowed_groups: values.allowed_groups
          ? typeof values.allowed_groups === "string"
            ? values.allowed_groups
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean)
            : values.allowed_groups
          : [],
      };

      const payload =
        modalMode === "edit" && modalData?.id
          ? { id: modalData.id, ...processedValues }
          : processedValues;

      await createCategory(payload);
      message.success(
        modalMode === "edit"
          ? "دسته‌بندی با موفقیت ویرایش شد."
          : "با موفقیت دسته‌بندی جدید اضافه شد.",
      );
      closeModal();
      refetch();
    } catch (error) {
      console.error(error);
      message.error("مشکلی در انجام عملیات پیش آمده است");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        name: modalData.name,
        slug: modalData.slug,
        order: modalData.order,
        icon: modalData.icon,
        description: modalData.description,
        allowed_groups: Array.isArray(modalData.allowed_groups)
          ? modalData.allowed_groups.join(", ")
          : modalData.allowed_groups,
        is_collapsed_by_default: modalData.is_collapsed_by_default,
      });
    }
  }, [isOpen, modalMode, modalData, form]);

  return (
    <Modal
      size={500}
      isOpen={isOpen}
      onClose={closeModal}
      onSubmit={() => form.submit()}
    >
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
            <Form.Item
              name="allowed_groups"
              label="گروه‌های مجاز (با کاما جدا کنید)"
            >
              <Input placeholder="group1, group2" />
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
