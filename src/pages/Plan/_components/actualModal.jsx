import { Form, InputNumber, message, Tooltip } from "antd";
import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { useCreateProductionActual } from "../../../QueryServises/PlanQuery";
import { MONTH_NAMES } from "./PlanPeriodsChart";
import Date from "../../../components/DatePicker/Date";

// modalData = رکورد دوره (period)
const ActualModal = ({ isOpen, modalData, closeModal, refetch }) => {
  const [form] = Form.useForm();
  const { mutateAsync: addActual, isPending } = useCreateProductionActual();

  useEffect(() => {
    if (isOpen) form.resetFields();
  }, [isOpen, form]);

  const onFinish = async (values) => {
    try {
      await addActual({
        production_plan_period_id: modalData?.id,
        production_date: values.production_date,
        quantity_produced: values.quantity_produced,
      });
      message.success("تولید واقعی با موفقیت ثبت شد");
      refetch?.();
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.detail ?? "خطا در ثبت تولید واقعی");
      console.error(error);
    }
  };

  const monthName = modalData?.period_month
    ? MONTH_NAMES[modalData.period_month - 1]
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`ثبت تولید واقعی${monthName ? ` — دوره ${monthName}` : ""}`}
      onSubmit={() => form.submit()}
      loading={isPending}
    >
      <div className="p-1">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {/* <Form.Item
              name="production_date"
              label="تاریخ تولید"
              rules={[{ required: true, message: "تاریخ تولید الزامی است" }]}
            > */}
            <Date
              stringifyDate={true}
              noStyle
              isRequired
              label="تاریخ تولید"
              name="production_date"
            />
            {/* </Form.Item> */}

            <Form.Item
              name="quantity_produced"
              label={
                <Tooltip title="مقدار تولید شده در هر دوره">
                  <span>مقدار تولید شده</span>
                </Tooltip>
              }
              rules={[{ required: true, message: "مقدار الزامی است" }]}
            >
              <InputNumber className="!w-full" min={0} placeholder="مثلاً ۲۳" />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ActualModal;
