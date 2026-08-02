import { Form, Input, InputNumber, message, Select, Tooltip } from "antd";
import { useEffect } from "react";
import Modal from "../../../components/Modal";
import {
  useCreateProductionActual,
  useUpdateProductionActual,
} from "../../../QueryServises/PlanQuery";
import { MONTH_NAMES } from "./PlanPeriodsChart";

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({
  value: i + 1,
  label: name,
}));

const ActualModal = ({ isOpen, modalData, closeModal, refetch, modalMode }) => {
  const [form] = Form.useForm();
  const { mutateAsync: addActual, isPending } = useCreateProductionActual();
  const { mutateAsync: updateActual } = useUpdateProductionActual();
  const isEdit = modalMode === "edit";
  const actualId = modalData?.actual_id ?? modalData?.id;

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && modalData) {
      form.setFieldsValue({
        production_plan_id: modalData?.production_plan_id,
        production_month: modalData.production_month,
        quantity_produced: modalData.quantity_produced,
      });
    } else {
      form.resetFields();
      if (modalData?.production_plan_id != null) {
        form.setFieldsValue({ production_plan_id: modalData.production_plan_id });
      }
    }
  }, [isOpen, isEdit, modalData, form]);

  const onFinish = async (values) => {
    try {
      if (isEdit) {
        await updateActual({
          productionActualId: actualId,
          production_month: values.production_month,
          quantity_produced: values.quantity_produced,
        });
        message.success("تولید واقعی با موفقیت بروزرسانی شد");
      } else {
        await addActual({
          production_plan_id: values.production_plan_id,
          production_month: values.production_month,
          quantity_produced: values.quantity_produced,
        });
        message.success("تولید واقعی با موفقیت ثبت شد");
      }
      refetch?.();
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.detail ?? "خطا در ثبت تولید واقعی");
      console.error(error);
    }
  };

  const monthName = modalData?.production_month
    ? MONTH_NAMES[modalData.production_month - 1]
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`ثبت تولید واقعی${monthName ? ` — ماه ${monthName}` : ""}`}
      onSubmit={() => form.submit()}
      loading={isPending}
    >
      <div className="p-1">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="production_month"
              label="ماه تولید"
              rules={[{ required: true, message: "انتخاب ماه الزامی است" }]}
            >
              <Select options={MONTH_OPTIONS} placeholder="انتخاب ماه" />
            </Form.Item>

            <Form.Item
              name="quantity_produced"
              label={
                <Tooltip title="مقدار تولید شده در هر ماه">
                  <span>مقدار تولید شده</span>
                </Tooltip>
              }
              rules={[{ required: true, message: "مقدار الزامی است" }]}
            >
              <InputNumber className="!w-full" min={0} placeholder="مثلاً ۲۳" />
            </Form.Item>
          </div>

          {!isEdit && (
            <Form.Item name="production_plan_id" hidden>
              <Input />
            </Form.Item>
          )}
        </Form>
      </div>
    </Modal>
  );
};

export default ActualModal;
