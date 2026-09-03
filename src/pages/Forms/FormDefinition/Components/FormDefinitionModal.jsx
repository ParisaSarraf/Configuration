import { useEffect } from "react";
import { Col, Form, Input, InputNumber, Checkbox, Row, message } from "antd";
import Modal from "../../../../components/Modal";
import {
  useCreateFormDefinition,
  useUpdateFormDefinition,
} from "../../../../QueryServises/formsQuery";
import Date from "../../../../components/DatePicker/Date";
import { georgianDateToJalaliDate, jalaliDateToGeorgianDate } from "../../../../utils/timeTool";

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
      category_id: isEdit
        ? (modalData?.category?.id ?? modalData?.category_id ?? null)
        : modalData?.id,
      name: values.name,
      description: values.description,
      is_active: values.is_active ?? true,
      version: values.version,
      close_date: jalaliDateToGeorgianDate(values.close_date) || null,
      max_submissions: values.max_submissions ?? null,
      success_message: values.success_message || "",
      success_redirect_url: values.success_redirect_url || "",
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
        close_date: georgianDateToJalaliDate(modalData.close_date),
        max_submissions: modalData.max_submissions ?? null,
        success_message: modalData.success_message || "",
        success_redirect_url: modalData.success_redirect_url || "",
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

          <Col span={8}>
            <Form.Item
              name="max_submissions"
              label="حداکثر تعداد ارسال"
              extra="خالی بگذارید تا محدودیتی نباشد"
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="بدون محدودیت"
              />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              name="success_redirect_url"
              label="صفحهٔ مقصد پس از ارسال موفق"
              rules={[{ type: "url", message: "نشانی معتبر وارد کنید" }]}
            >
              <Input
                dir="ltr"
                placeholder="https://example.com/thanks"
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="success_message" label="پیغام پس از ارسال فرم">
              <Input.TextArea
                rows={2}
                maxLength={300}
                showCount
                placeholder="فرم شما با موفقیت ثبت شد."
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
