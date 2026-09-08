import { Form, InputNumber, Spin, Tooltip, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../../../components/Modal";
import {
  useCreateProductionActual,
  useUpdateProductionActual,
  useDeleteProductionActual,
} from "../../../QueryServises/PlanQuery";
import { MONTH_NAMES } from "./PlanPeriodsChart";

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({
  value: i + 1,
  label: name,
}));

const makeEmptyRowStates = () =>
  Array.from({ length: 12 }, () => ({
    status: "idle", // "idle" | "loading" | "success" | "error"
    error: null,
  }));

const toNum = (v) =>
  v === undefined || v === null || v === "" || Number.isNaN(Number(v))
    ? null
    : Number(v);

const ActualModal = ({ isOpen, modalData, closeModal, refetch, modalMode }) => {
  const [form] = Form.useForm();
  const { mutateAsync: addActual } = useCreateProductionActual();
  const { mutateAsync: updateActual } = useUpdateProductionActual();
  const { mutateAsync: deleteActual } = useDeleteProductionActual();

  const [rowStates, setRowStates] = useState(makeEmptyRowStates);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baselineRef = useRef({});
  const focusInputRef = useRef(null);

  const isEdit = modalMode === "edit";
  const focusMonth = toNum(modalData?.focusMonth);

  const existingByMonth = useMemo(() => {
    let actuals = [];

    if (Array.isArray(modalData?.actuals)) {
      actuals = modalData.actuals;
    } else if (isEdit && modalData?.production_month) {
      actuals = [
        {
          id: modalData.actual_id ?? modalData.id,
          production_month: modalData.production_month,
          quantity_produced: modalData.quantity_produced,
        },
      ];
    }

    return actuals.reduce((acc, a) => {
      const month = toNum(a?.production_month);
      if (month != null) acc[month] = a;
      return acc;
    }, {});
  }, [modalData, isEdit]);

  const initialValues = useMemo(() => {
    const values = {};
    MONTH_OPTIONS.forEach(({ value }) => {
      values[`month_${value}`] = toNum(
        existingByMonth[value]?.quantity_produced,
      );
    });
    return values;
  }, [existingByMonth]);

  const dataKey = useMemo(() => JSON.stringify(initialValues), [initialValues]);

  const productionPlanId = modalData?.production_plan_id;

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setRowStates(makeEmptyRowStates());
      baselineRef.current = {};
      return;
    }

    baselineRef.current = initialValues;
    form.resetFields();
    form.setFieldsValue(initialValues);
    setRowStates(makeEmptyRowStates());
  }, [isOpen, dataKey, form]);

  useEffect(() => {
    if (!isOpen || focusMonth == null) return;
    const timer = setTimeout(() => focusInputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [isOpen, focusMonth, dataKey]);

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
      const key = `month_${monthNum}`;
      const nextValue = toNum(values[key]);
      const prevValue = toNum(baselineRef.current[key]);
      const existing = existingByMonth[monthNum];

      if (nextValue === prevValue) {
        setRowState(i, {
          status: existing ? "success" : "idle",
          error: null,
        });
        continue;
      }

      setRowState(i, { status: "loading", error: null });

      try {
        if (nextValue === null) {
          if (existing?.id != null) {
            await deleteActual(existing.id);
            // await updateActual({
            //   productionActualId: existing.id,
            //   production_month: monthNum,
            //   quantity_produced: null,
            // });
          }
          setRowState(i, { status: "idle", error: null });
          continue;
        }

        if (existing?.id != null) {
          await updateActual({
            productionActualId: existing.id,
            production_month: monthNum,
            quantity_produced: nextValue,
          });
        } else {
          if (productionPlanId == null) {
            throw new Error("شناسه برنامه تولید یافت نشد");
          }
          await addActual({
            production_plan_id: productionPlanId,
            production_month: monthNum,
            quantity_produced: nextValue,
          });
        }

        setRowState(i, { status: "success", error: null });
      } catch (error) {
        const errMsg =
          error?.response?.data?.detail ??
          error?.message ??
          "خطا در ثبت این ماه";
        setRowState(i, { status: "error", error: errMsg });
        message.error(
          `ثبت ${MONTH_OPTIONS[i].label} با خطا مواجه شد. مقدار را بررسی و دوباره تلاش کنید.`,
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
    let values;
    try {
      values = await form.validateFields();
    } catch (err) {
      console.warn("اعتبارسنجی فرم رد شد:", err);
      return;
    }

    const hasChanges = MONTH_OPTIONS.some(({ value }) => {
      const key = `month_${value}`;
      return toNum(values[key]) !== toNum(baselineRef.current[key]);
    });

    if (!hasChanges) {
      message.info("تغییری برای ذخیره وجود ندارد");
      return;
    }

    const success = await runSubmission(values);
    if (success) {
      message.success("تولید واقعی با موفقیت ذخیره شد");
      refetch?.();
      closeModal();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="ثبت تولید واقعی ۱۲ ماهه"
      onSubmit={handleSubmit}
      loading={isSubmitting}
    >
      <div className="p-1">
        <p className="mb-3 text-xs text-slate-500">
          مقادیر ثبت‌شده از قبل پر شده‌اند. برای حذف مقدار یک ماه، فیلد آن را
          خالی کنید.
        </p>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          preserve={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {MONTH_OPTIONS.map(({ value, label }, i) => {
              const rowState = rowStates[i];
              const rowLocked = isSubmitting || rowState.status === "loading";
              const isFocused = focusMonth === value;

              return (
                <div
                  key={value}
                  className={`flex items-center gap-2 rounded-md px-1 py-0.5 ${
                    isFocused ? "bg-emerald-50 ring-1 ring-emerald-200" : ""
                  }`}
                >
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
                      ref={isFocused ? focusInputRef : undefined}
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

export default ActualModal;
