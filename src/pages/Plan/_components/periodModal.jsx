import { Form, InputNumber, Spin, Tooltip, message } from "antd";
import { useEffect, useMemo, useState } from "react";
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

const EMPTY_ROW_STATES = Array.from({ length: 12 }, () => ({
  status: "idle", // "idle" | "loading" | "success" | "error"
  error: null,
}));

const PeriodModal = ({ isOpen, modalData, closeModal, refetch, modalMode }) => {
  const [form] = Form.useForm();
  const { mutateAsync: addPeriod } = useCreateProductionPlanPeriod();
  const { mutateAsync: updatePeriod } = useUpdateProductionPlanPeriod();

  const [rowStates, setRowStates] = useState(EMPTY_ROW_STATES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = modalMode === "edit";

  const existingByMonth = useMemo(() => {
    let periods = [];
    if (Array.isArray(modalData?.periods)) {
      periods = modalData.periods;
    } else if (isEdit && modalData?.period_month) {
      periods = [
        {
          id: modalData.id,
          period_month: modalData.period_month,
          planned_quantity: modalData.planned_quantity,
        },
      ];
    }
    return periods.reduce((acc, p) => {
      acc[p.period_month] = p;
      return acc;
    }, {});
  }, [modalData, isEdit]);

  const productionPlanId = modalData?.production_plan_id ?? modalData?.id;

  useEffect(() => {
    if (!isOpen) return;

    const initialValues = {};
    const initialRowStates = EMPTY_ROW_STATES.map((row) => ({ ...row }));

    MONTH_OPTIONS.forEach(({ value }, i) => {
      const existing = existingByMonth[value];
      initialValues[`month_${value}`] = existing?.planned_quantity ?? undefined;
      if (existing) {
        initialRowStates[i] = { status: "success", error: null };
      }
    });

    form.setFieldsValue(initialValues);
    setRowStates(initialRowStates);
  }, [isOpen, existingByMonth, form]);

  const setRowState = (index, nextState) => {
    setRowStates((prev) => {
      const next = [...prev];
      next[index] = nextState;
      return next;
    });
  };

  const runSubmission = async (values) => {
    setIsSubmitting(true);

    for (let i = 0; i < MONTH_OPTIONS.length; i++) {
      const monthNum = MONTH_OPTIONS[i].value;

      if (rowStates[i].status === "success") continue;

      const qty = values[`month_${monthNum}`];
      if (qty === undefined || qty === null || qty === "") {
        setRowState(i, { status: "idle", error: null });
        continue;
      }

      setRowState(i, { status: "loading", error: null });

      try {
        const existing = existingByMonth[monthNum];
        if (existing) {
          await updatePeriod({
            productionPlanId: existing.id,
            period_month: monthNum,
            planned_quantity: qty,
          });
        } else {
          await addPeriod({
            production_plan_id: productionPlanId,
            period_month: monthNum,
            planned_quantity: qty,
          });
        }
        setRowState(i, { status: "success", error: null });
      } catch (error) {
        const errMsg =
          error?.response?.data?.detail ?? "خطا در ثبت این ماه";
        setRowState(i, { status: "error", error: errMsg });
        message.error(
          `ثبت ${MONTH_OPTIONS[i].label} با خطا مواجه شد. مقدار را بررسی و دوباره تلاش کنید.`
        );
        console.error(error);
        setIsSubmitting(false);
        return false;
      }
    }

    setIsSubmitting(false);
    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const hasAnyValue = MONTH_OPTIONS.some(
        ({ value }) =>
          values[`month_${value}`] !== undefined &&
          values[`month_${value}`] !== null
      );

      if (!hasAnyValue) {
        message.warning("حداقل مقدار یک ماه را وارد کنید");
        return;
      }

      const success = await runSubmission(values);
      if (success) {
        message.success("مقادیر برنامه‌ریزی تولید با موفقیت ثبت شد");
        refetch?.();
        closeModal();
      }
    } catch {
      // form.validateFields() rejected — inline field errors are already shown.
    }
  };

  const productLabel =
    modalData?.product?.persian_title ?? modalData?.product_name;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`برنامه‌ریزی تولید ۱۲ ماهه${productLabel ? ` — ${productLabel}` : ""}`}
      onSubmit={handleSubmit}
      loading={isSubmitting}
    >
      <div className="p-1">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {MONTH_OPTIONS.map(({ value, label }, i) => {
              const rowState = rowStates[i];
              const rowLocked = isSubmitting || rowState.status === "loading";

              return (
                <div key={value} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-sm text-slate-600">
                    {label}
                  </span>

                  <Form.Item
                    name={`month_${value}`}
                    className="!mb-0 flex-1"
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        message: "مقدار باید عددی و بزرگ‌تر یا مساوی صفر باشد",
                      },
                    ]}
                  >
                    <InputNumber
                      className="!w-full"
                      min={0}
                      placeholder="—"
                      disabled={rowLocked}
                    />
                  </Form.Item>

                  <span className="w-4 shrink-0 text-center">
                    {rowState.status === "loading" && <Spin size="small" />}
                    {rowState.status === "success" && (
                      <span className="text-green-600" title="ثبت شد">
                        ✓
                      </span>
                    )}
                    {rowState.status === "error" && (
                      <Tooltip title={rowState.error}>
                        <span className="text-red-600 cursor-help">✕</span>
                      </Tooltip>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default PeriodModal;
