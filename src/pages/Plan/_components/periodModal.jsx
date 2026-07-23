import { Form, Input, InputNumber, Select, message } from "antd";
import { useEffect } from "react";
import Modal from "../../../components/Modal";
import {  useCreateProductionPlanPeriod } from "../../../QueryServises/PlanQuery";
import { MONTH_NAMES } from "./PlanPeriodsChart";

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({
  value: i + 1,
  label: name,
}));

// modalData = رکورد برنامه تولید (plan)
const PeriodModal = ({ isOpen, modalData, closeModal, refetch }) => {
  const [form] = Form.useForm();
  const { mutateAsync: addPeriod, isPending } = useCreateProductionPlanPeriod();

  useEffect(() => {
    if (isOpen) form.resetFields();
  }, [isOpen, form]);

  const onFinish = async (values) => {
    try {
      await addPeriod({
        production_plan_id: modalData?.id,
        ...values,
      });
      message.success("دوره تولید با موفقیت ثبت شد");
      refetch?.();
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.detail ?? "خطا در ثبت دوره تولید");
      console.error(error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`افزودن دوره تولید${
        modalData?.product?.persian_title
          ? ` — ${modalData.product.persian_title}`
          : ""
      }`}
      onSubmit={() => form.submit()}
      loading={isPending}
    >
      <div className="p-1">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="period_month"
              label="ماه دوره"
              rules={[{ required: true, message: "انتخاب ماه الزامی است" }]}
            >
              <Select options={MONTH_OPTIONS} placeholder="انتخاب ماه" />
            </Form.Item>

            <Form.Item
              name="planned_quantity"
              label="مقدار برنامه‌ریزی شده"
              rules={[{ required: true, message: "مقدار الزامی است" }]}
            >
              <InputNumber
                className="!w-full"
                min={0}
                placeholder="مثلاً ۱۰۰"
              />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="توضیحات">
            <Input.TextArea rows={3} placeholder="توضیحات تکمیلی..." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default PeriodModal;
