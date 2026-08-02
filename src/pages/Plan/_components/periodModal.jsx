import { Form, Input, InputNumber, Select, message } from "antd";
import { useEffect } from "react";
import Modal from "../../../components/Modal";
import {
  useCreateProductionPlanPeriod,
  useUpdateProductionPlanPeriod,
} from "../../../QueryServises/PlanQuery";
import { MONTH_NAMES } from "./PlanPeriodsChart";

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({
  value: i + 1,
  label: name,
}));

const PeriodModal = ({ isOpen, modalData, closeModal, refetch, modalMode }) => {
  const [form] = Form.useForm();
  const { mutateAsync: addPeriod, isPending: isAdding } =
    useCreateProductionPlanPeriod();
  const { mutateAsync: updatePeriod, isPending: isUpdating } =
    useUpdateProductionPlanPeriod();
  const isLoading = isAdding || isUpdating;
  const isEdit = modalMode === "edit";

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && modalData) {
      form.setFieldsValue({
        period_month: modalData.period_month,
        planned_quantity: modalData.planned_quantity,
        notes: modalData.notes,
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, isEdit, modalData, form]);

  const onFinish = async (values) => {
    try {
      if (isEdit) {
        await updatePeriod({
          productionPlanId: modalData.id,
          period_month: values.period_month,
          planned_quantity: values.planned_quantity,
          notes: values.notes,
        });
        message.success("دوره تولید با موفقیت بروزرسانی شد");
      } else {
        await addPeriod({
          production_plan_id: modalData?.id,
          ...values,
        });
        message.success("دوره تولید با موفقیت ثبت شد");
      }
      refetch?.();
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.detail ?? "خطا در ثبت دوره تولید");
      console.error(error);
    }
  };

  const plannedWeight = modalData?.planed_weight;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`${isEdit ? "ویرایش" : "افزودن"} دوره تولید${
        modalData?.product?.persian_title ?? modalData?.product_name
          ? ` — ${modalData?.product?.persian_title ?? modalData?.product_name}`
          : ""
      }`}
      onSubmit={() => form.submit()}
      loading={isLoading}
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

          <Form.Item
            label="وزن برنامه‌ریزی‌شده"
            extra={
              isEdit
                ? "این مقدار به‌صورت خودکار محاسبه شده و قابل ویرایش نیست"
                : "این مقدار پس از ثبت دوره به‌صورت خودکار محاسبه می‌شود"
            }
          >
            <Input
              readOnly
              className="!bg-slate-50"
              value={
                plannedWeight != null
                  ? Number(plannedWeight).toLocaleString("fa-IR")
                  : ""
              }
              placeholder="—"
            />
          </Form.Item>

          <Form.Item name="notes" label="توضیحات">
            <Input.TextArea rows={3} placeholder="توضیحات تکمیلی..." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default PeriodModal;
