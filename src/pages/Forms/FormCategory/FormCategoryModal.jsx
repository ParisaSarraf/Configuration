import { useEffect } from "react";
import { Col, Form, Input, InputNumber, Checkbox, message, Row } from "antd";

import Modal from "../../../components/Modal";

import {
  useCreateFormCategory,
  useUpdateFormCategory,
} from "../../../QueryServises/formsQuery";

const FormCategoryModal = ({
  isOpen,
  closeModal,
  modalMode,
  modalData,
  refetch,
}) => {
  const [form] = Form.useForm();

  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateFormCategory();

  const { mutateAsync: editCategory, isPending: isUpdating } =
    useUpdateFormCategory();

  const isEdit = modalMode === "edit";
  const isPending = isCreating || isUpdating;

  // =========================
  // Submit
  // =========================
  const onFinish = async (values) => {
    try {
      const processedValues = {
        ...values,

        allowed_groups: values.allowed_groups
          ? typeof values.allowed_groups === "string"
            ? values.allowed_groups
                .split(",")
                .map((group) => group.trim())
                .filter(Boolean)
            : values.allowed_groups
          : [],
      };

      if (isEdit && modalData?.id) {
        await editCategory({
          FormCategoryId: modalData.id,
          ...processedValues,
        });

        message.success("دسته‌بندی با موفقیت ویرایش شد.");
      } else {
        await createCategory(processedValues);

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

  // =========================
  // Set form values
  // =========================
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.resetFields();

    if (isEdit && modalData) {
      form.setFieldsValue({
        name: modalData.name ?? "",
        order: modalData.order ?? 0,
        icon: modalData.icon ?? "",
        description: modalData.description ?? "",
        allowed_groups: Array.isArray(modalData.allowed_groups)
          ? modalData.allowed_groups.join(", ")
          : (modalData.allowed_groups ?? ""),

        is_collapsed_by_default: modalData.is_collapsed_by_default ?? false,
      });
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
          {/* Name */}
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


          {/* Order */}
          <Col span={12}>
            <Form.Item name="order" label="ترتیب" initialValue={0}>
              <InputNumber min={0} className="w-full" placeholder="0" />
            </Form.Item>
          </Col>

          {/* Icon */}
          <Col span={12}>
            <Form.Item name="icon" label="آیکون">
              <Input placeholder="مثلاً folder" allowClear />
            </Form.Item>
          </Col>

          {/* Description */}
          <Col span={24}>
            <Form.Item name="description" label="توضیحات">
              <Input.TextArea
                rows={3}
                placeholder="توضیحات دسته‌بندی..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          {/* Allowed Groups */}
          <Col span={12}>
            <Form.Item
              name="allowed_groups"
              label="گروه‌های مجاز"
              extra="گروه‌ها را با کاما جدا کنید"
            >
              <Input placeholder="group1, group2" allowClear />
            </Form.Item>
          </Col>

          {/* Collapsed */}
          <Col span={12} className="flex items-center">
            <Form.Item
              name="is_collapsed_by_default"
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox>پیش‌فرض بسته باشد</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormCategoryModal;
