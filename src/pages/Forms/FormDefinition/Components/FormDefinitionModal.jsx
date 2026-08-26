import { useEffect } from "react";
import {
  Col,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Row,
  DatePicker,
  Divider,
  message,
} from "antd";
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
      ...values,
      category_id: modalData,
      created_by_id: Number(values.created_by_id),
      version: Number(values.version || 1),
      max_submissions:
        values.max_submissions !== undefined &&
        values.max_submissions !== null &&
        values.max_submissions !== ""
          ? Number(values.max_submissions)
          : null,
      submit_groups: values.submit_groups
        ? String(values.submit_groups)
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((item) => !Number.isNaN(item))
        : [],
      view_groups: values.view_groups
        ? String(values.view_groups)
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((item) => !Number.isNaN(item))
        : [],
      close_date: values.close_date ? values.close_date : null,
    };
    try {
      if (isEdit && modalData?.id) {``
        await updateDefinition({
          FormDefinitionId: modalData.id,
          ...payload,
        });
      } else {
        await createDefinition(payload);
        message.success("غرم باموفقیت ایجاد شد.");
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
    form.resetFields();
    if (isEdit && modalData) {
      form.setFieldsValue({
        category_id: modalData.category_id,
        created_by_id: modalData.created_by_id,
        name: modalData.name ?? "",
        slug: modalData.slug ?? "",
        description: modalData.description ?? "",
        is_active: modalData.is_active ?? true,
        version: modalData.version ?? 1,
        close_date: modalData.close_date ? dayjs(modalData.close_date) : null,
        max_submissions: modalData.max_submissions ?? null,
        enable_auto_save: modalData.enable_auto_save ?? true,
        auto_save_interval: modalData.auto_save_interval ?? 30,
        success_message: modalData.success_message ?? "",
        success_redirect_url: modalData.success_redirect_url ?? "",
        submit_groups: Array.isArray(modalData.submit_groups)
          ? modalData.submit_groups.join(", ")
          : "",
        view_groups: Array.isArray(modalData.view_groups)
          ? modalData.view_groups.join(", ")
          : "",
      });
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
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isPending}
      >
        {/* اطلاعات اصلی */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700">اطلاعات فرم</h3>
        </div>

        <Row gutter={[12, 0]}>
          <Col span={12}>
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

          <Col span={12}>
            <Form.Item
              name="slug"
              label="Slug"
              rules={[
                {
                  required: true,
                  message: "Slug را وارد کنید",
                },
              ]}
            >
              <Input placeholder="example-form" allowClear />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="category_id"
              label="دسته‌بندی"
              rules={[
                {
                  required: true,
                  message: "دسته‌بندی را وارد کنید",
                },
              ]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="شناسه دسته‌بندی"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="created_by_id"
              label="ایجادکننده"
              rules={[
                {
                  required: true,
                  message: "ایجادکننده را وارد کنید",
                },
              ]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="شناسه ایجادکننده"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="description" label="توضیحات">
              <Input.TextArea
                rows={2}
                placeholder="توضیحات فرم..."
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="version" label="نسخه" initialValue={1}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </Col>

          <Col span={12} className="flex items-center">
            <Form.Item
              name="is_active"
              valuePropName="checked"
              className="mb-3"
            >
              <Checkbox>فرم فعال باشد</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* تنظیمات ارسال */}
        <div className="mb-3 mt-2 border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-700">تنظیمات ارسال</h3>
        </div>

        <Row gutter={[12, 0]}>
          <Col span={12}>
            <Form.Item name="max_submissions" label="حداکثر ارسال">
              <InputNumber
                min={0}
                className="w-full"
                placeholder="بدون محدودیت"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Date
              label="تاریخ پایان"
              name="close_date"
              stringifyDate={true}
              noStyle
              isRequired
            />
          </Col>

          <Col span={12}>
            <Form.Item
              name="enable_auto_save"
              valuePropName="checked"
              className="mb-3"
            >
              <Checkbox>ذخیره خودکار</Checkbox>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="auto_save_interval" label="فاصله ذخیره">
              <InputNumber min={1} className="w-full" placeholder="ثانیه" />
            </Form.Item>
          </Col>
        </Row>

        {/* بعد از ارسال */}
        <div className="mb-3 mt-2 border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-700">بعد از ارسال</h3>
        </div>

        <Row gutter={[12, 0]}>
          <Col span={12}>
            <Form.Item name="success_message" label="پیام موفقیت">
              <Input.TextArea rows={2} placeholder="فرم با موفقیت ثبت شد." />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="success_redirect_url" label="آدرس انتقال">
              <Input placeholder="https://example.com/success" allowClear />
            </Form.Item>
          </Col>
        </Row>

        {/* دسترسی */}
        <div className="mb-3 mt-2 border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-700">دسترسی</h3>
        </div>

        <Row gutter={[12, 0]}>
          <Col span={12}>
            <Form.Item name="submit_groups" label="گروه‌های ارسال">
              <Input placeholder="1, 2, 5" allowClear />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="view_groups" label="گروه‌های مشاهده">
              <Input placeholder="1, 2, 5" allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormDefinitionModal;
