import { useEffect } from "react";
import { Col, Form, Input, InputNumber, Checkbox, Row, message } from "antd";
import Modal from "../../../../components/Modal";
import {
  useCreateFormDefinition,
  useUpdateFormDefinition,
} from "../../../../QueryServises/formsQuery";
import Date from "../../../../components/DatePicker/Date";

const FormDefinitionModal = ({
  isOpen,
  closeModal,
  modalMode,
  modalData,
  refetch,
}) => {
  const [form] = Form.useForm();

  const { mutateAsync: createDefinition, isPending: isCreating } =
    useCreateFormDefinition();

  const { mutateAsync: updateDefinition, isPending: isUpdating } =
    useUpdateFormDefinition();

  const isEdit = modalMode === "edit";
  const isPending = isCreating || isUpdating;

  const onFinish = async (values) => {
    const payload = {
      category_id: modalData.id, 
      name: values.name,
      description: values.description,
      is_active: values.is_active ?? true,
      version: values.version,
      close_date: values.close_date || null,
      max_submissions: values.max_submissions ?? null,
    };

    try {
      if (isEdit && modalData?.id) {
        await updateDefinition({
          FormDefinitionId: modalData.id,
          ...payload,
        });
        message.success("فرم با موفقیت ویرایش شد.");
      } else {
        await createDefinition(payload);
        message.success("فرم با موفقیت ایجاد شد.");
      }
      closeModal();
      await refetch();
    } catch (error) {
      console.error("Form definition error:", error);
      message.error("مشکلی پیش آمده است.");
    }
  };

console.log(modalData);



  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      return;
    }

    if (isEdit && modalData) {
      form.setFieldsValue({
        category_id: modalData.category?.id,
        name: modalData.name,
        description: modalData.description,
        is_active: modalData.is_active ,
        version: modalData.version,
        close_date: modalData.close_date,
        max_submissions: modalData.max_submissions ?? null,
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, isEdit, modalData, form]);

  return (
    <Modal
      size={700}
      isOpen={isOpen}
      onClose={closeModal}
      onSubmit={() => form.submit()}
      loading={isPending}
      className="scroll-modal"
      title={`${isEdit ? "ویرایش فرم" : "ایجاد فرم"}`}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isPending}
      >
        <Row gutter={[12]}>
          <Col span={8}>
            <Form.Item
              name="name"
              label="نام فرم"
              rules={[
                {
                  required: true,
                  message: "نام فرم را وارد کنید",
                },
              ]}
            >
              <Input placeholder="نام فرم" allowClear />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="version" label="نسخه" initialValue={1}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Date
              label="تاریخ پایان"
              name="close_date"
              stringifyDate={true}
              noStyle
            />
          </Col>

          <Col span={24}>
            <Form.Item name="description" label="توضیحات">
              <Input.TextArea
                rows={2}
                placeholder="توضیحات فرم..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="is_active"
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox>فرم فعال باشد</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormDefinitionModal;
