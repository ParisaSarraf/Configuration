import { useEffect, useRef } from "react";
import { Col, Form, Input, InputNumber, Checkbox, message, Row } from "antd";

import Modal from "../../../components/Modal";

import {
  useCreateFormCategory,
  useUpdateFormCategory,
} from "../../../QueryServises/formsQuery";
import IconPicker from "../../../components/IconPicker/Index";

const FormCategoryModal = ({
  isOpen,
  closeModal,
  modalMode,
  modalData,
  refetch,
}) => {
  const [form] = Form.useForm();

  const initialValuesRef = useRef({});

  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateFormCategory();

  const { mutateAsync: editCategory, isPending: isUpdating } =
    useUpdateFormCategory();

  const isEdit = modalMode === "edit";
  const isPending = isCreating || isUpdating;

  const onFinish = async (values) => {
    const payload = {
      name: values.name ?? "",
      order: values.order ?? 0,
      icon: values.icon ?? "",
      description: values.description ?? "",
      is_collapsed_by_default: values.is_collapsed_by_default ?? false,
    };

    try {
      if (isEdit && modalData?.id) {
        const changedFields = Object.keys(payload).reduce((acc, key) => {
          if (payload[key] !== initialValuesRef.current[key]) {
            acc[key] = payload[key];
          }
          return acc;
        }, {});

        if (Object.keys(changedFields).length === 0) {
          closeModal();
          return;
        }

        await editCategory({
          FormCategoryId: modalData.id,
          ...changedFields,
        });
        message.success("دسته‌بندی با موفقیت ویرایش شد.");
      } else {
        await createCategory(payload);
        message.success("دسته‌بندی جدید با موفقیت ایجاد شد.");
      }
      closeModal();
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Category submit error:", error);
      message.error(
        isEdit
          ? "ویرایش دسته‌بندی با مشکل مواجه شد."
          : "ایجاد دسته‌بندی با مشکل مواجه شد.",
      );
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    form.resetFields();
    if (isEdit && modalData) {
      const values = {
        name: modalData.name ?? "",
        order: modalData.order ?? 0,
        icon: modalData.icon ?? "",
        description: modalData.description ?? "",
        is_collapsed_by_default: modalData.is_collapsed_by_default ?? false,
      };
      form.setFieldsValue({
        ...values,
      });
      initialValuesRef.current = values;
    }
  }, [isOpen, isEdit, modalData, form]);

  return (
    <Modal
      mode={modalMode}
      className="scroll-modal"
      destroyOnClose
      size={500}
      isOpen={isOpen}
      onClose={closeModal}
      onSubmit={() => form.submit()}
      loading={isPending}
      title={isEdit ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isPending}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="نام دسته‌بندی"
              rules={[
                {
                  required: true,
                  message: "نام دسته‌بندی را وارد کنید",
                },
              ]}
            >
              <Input placeholder="مثلاً فرم‌های اداری" allowClear />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="order" label="ترتیب نمایش فرم در لیست">
              <InputNumber min={0} className="w-full" placeholder="0" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="توضیحات"
              rules={[
                {
                  required: true,
                  message: "توضیحات دسته‌بندی را وارد کنید",
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="توضیحات دسته‌بندی..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="icon" label="آیکون">
              <IconPicker />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormCategoryModal;
