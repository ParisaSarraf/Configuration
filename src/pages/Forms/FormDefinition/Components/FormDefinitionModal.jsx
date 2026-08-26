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
      close_date: values.close_date ? values.close_date.toISOString() : null,
    };
    try {
      if (isEdit && modalData?.id) {
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
      className={"scroll-modal"}
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
              label="نام فرم"
              rules={[
                {
                  required: true,
                  message: "نام فرم را وارد کنید",
                },
              ]}
            >
              <Input placeholder="مثلاً فرم درخواست مرخصی" allowClear />
            </Form.Item>
          </Col>

          {/* Slug */}
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
              <Input placeholder="leave-request-form" allowClear />
            </Form.Item>
          </Col>

          {/* Category */}
          <Col span={12}>
            <Form.Item
              name="category_id"
              label="شناسه دسته‌بندی"
              rules={[
                {
                  required: true,
                  message: "شناسه دسته‌بندی را وارد کنید",
                },
              ]}
            >
              <InputNumber min={1} className="w-full" placeholder="مثلاً 1" />
            </Form.Item>
          </Col>

          {/* Created By */}
          <Col span={12}>
            <Form.Item
              name="created_by_id"
              label="شناسه ایجادکننده"
              rules={[
                {
                  required: true,
                  message: "شناسه ایجادکننده را وارد کنید",
                },
              ]}
            >
              <InputNumber min={1} className="w-full" placeholder="مثلاً 10" />
            </Form.Item>
          </Col>

          {/* Description */}
          <Col span={24}>
            <Form.Item name="description" label="توضیحات">
              <Input.TextArea
                rows={3}
                placeholder="توضیحات فرم..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>

          {/* Active */}
          <Col span={12}>
            <Form.Item name="is_active" valuePropName="checked">
              <Checkbox>فرم فعال باشد</Checkbox>
            </Form.Item>
          </Col>

          {/* Version */}
          <Col span={12}>
            <Form.Item name="version" label="نسخه" initialValue={1}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* ================================= */}
        {/* تنظیمات ارسال */}
        {/* ================================= */}

        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-800">تنظیمات ارسال</h3>

          <p className="mt-1 text-xs text-gray-400">
            محدودیت و رفتار ارسال فرم را تنظیم کنید.
          </p>
        </div>

        <Row gutter={12}>
          {/* Max submissions */}
          <Col span={12}>
            <Form.Item
              name="max_submissions"
              label="حداکثر تعداد ارسال"
              extra="خالی = بدون محدودیت"
            >
              <InputNumber
                min={0}
                className="w-full"
                placeholder="بدون محدودیت"
              />
            </Form.Item>
          </Col>

          {/* Close date */}
          <Col span={12}>
            <Form.Item
              name="close_date"
              label="تاریخ بسته شدن فرم"
              extra="خالی = بدون تاریخ پایان"
            >
              <DatePicker
                showTime
                className="w-full"
                placeholder="انتخاب تاریخ"
              />
            </Form.Item>
          </Col>

          {/* Auto save */}
          <Col span={12}>
            <Form.Item name="enable_auto_save" valuePropName="checked">
              <Checkbox>ذخیره خودکار فعال باشد</Checkbox>
            </Form.Item>
          </Col>

          {/* Auto save interval */}
          <Col span={12}>
            <Form.Item
              name="auto_save_interval"
              label="فاصله ذخیره خودکار"
              extra="بر حسب ثانیه"
            >
              <InputNumber min={1} className="w-full" placeholder="مثلاً 30" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* ================================= */}
        {/* پیام موفقیت */}
        {/* ================================= */}

        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-800">بعد از ارسال</h3>

          <p className="mt-1 text-xs text-gray-400">
            رفتار سیستم بعد از ارسال موفق فرم.
          </p>
        </div>

        <Row gutter={12}>
          {/* Success Message */}
          <Col span={24}>
            <Form.Item name="success_message" label="پیام موفقیت">
              <Input.TextArea
                rows={2}
                placeholder="فرم شما با موفقیت ثبت شد."
              />
            </Form.Item>
          </Col>

          {/* Redirect */}
          <Col span={24}>
            <Form.Item
              name="success_redirect_url"
              label="آدرس انتقال بعد از ارسال"
            >
              <Input placeholder="https://example.com/success" allowClear />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* ================================= */}
        {/* دسترسی */}
        {/* ================================= */}

        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-800">دسترسی‌ها</h3>

          <p className="mt-1 text-xs text-gray-400">
            شناسه گروه‌ها را با کاما جدا کنید.
          </p>
        </div>

        <Row gutter={12}>
          {/* Submit Groups */}
          <Col span={12}>
            <Form.Item
              name="submit_groups"
              label="گروه‌های مجاز برای ارسال"
              extra="مثلاً: 1, 2, 5"
            >
              <Input placeholder="1, 2, 5" allowClear />
            </Form.Item>
          </Col>

          {/* View Groups */}
          <Col span={12}>
            <Form.Item
              name="view_groups"
              label="گروه‌های مجاز برای مشاهده"
              extra="مثلاً: 1, 2, 5"
            >
              <Input placeholder="1, 2, 5" allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormDefinitionModal;
