import { useEffect } from "react";
import { Col, Form, Input, InputNumber, Row, Select, message } from "antd";
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
  categories = [],
  refetch,
}) => {
  const [form] = Form.useForm();

  const { mutateAsync: createDefinition, isPending: isCreating } =
    useCreateFormDefinition();

  const { mutateAsync: updateDefinition, isPending: isUpdating } =
    useUpdateFormDefinition();

  const isEdit = modalMode === "edit";
  const isPending = isCreating || isUpdating;
  const currentCategoryId = modalData?.category?.id ?? modalData?.category_id;
  const selectedCategoryId = currentCategoryId == null ? undefined : Number(currentCategoryId);
  const categoryOptions = categories.map(({ id, name }) => ({
    value: Number(id),
    label: name,
  }));
  if (
    isEdit &&
    selectedCategoryId !== undefined &&
    !categoryOptions.some(({ value }) => value === selectedCategoryId)
  ) {
    categoryOptions.push({
      value: selectedCategoryId,
      label: modalData.category?.name ?? String(selectedCategoryId),
    });
  }

  const onFinish = async (values) => {
    const payload = {
      category_id: isEdit
        ? (values.category_id ?? selectedCategoryId ?? null)
        : modalData?.id,
      name: values.name,
      description: values.description,
      version: values.version,
      close_date: jalaliDateToGeorgianDate(values.close_date) || null,
      success_message: values.success_message || "",
    };

    try {
      if (isEdit && modalData?.id) {
        await updateDefinition({
          FormDefinitionId: modalData.id,
          created_by_id: modalData.created_by?.id ?? modalData.created_by_id ?? null,
          ...payload,
        });
        message.success("فرم با موفقیت ویرایش شد.");
      } else {
        await createDefinition({
          ...payload,
          is_active: values.is_active ?? true,
          max_submissions: values.max_submissions ?? null,
          success_redirect_url: values.success_redirect_url || "",
        });
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
        category_id: selectedCategoryId,
        name: modalData.name,
        description: modalData.description,
        version: modalData.version,
        close_date: georgianDateToJalaliDate(modalData.close_date).replaceAll(
          "/",
          "-",
        ),
        success_message: modalData.success_message || "",
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, isEdit, modalData, form, selectedCategoryId]);

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
              noMaxDate
              noStyle
            />
          </Col>

          {isEdit && (
            <Col span={24}>
              <Form.Item name="category_id" label="دسته‌بندی">
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={categoryOptions}
                  placeholder="دسته‌بندی فرم را انتخاب کنید"
                />
              </Form.Item>
            </Col>
          )}

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

          {/* <Col span={8}>
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
          </Col> */}

          {/* <Col span={16}>
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
          </Col> */}

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

          {/* <Col span={24}>
            <Form.Item
              name="is_active"
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox>فرم فعال باشد</Checkbox>
            </Form.Item>
          </Col> */}
        </Row>
      </Form>
    </Modal>
  );
};

export default FormDefinitionModal;
