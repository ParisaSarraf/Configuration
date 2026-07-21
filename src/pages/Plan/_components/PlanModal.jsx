import { Form, Input, InputNumber, message, Select } from "antd";
import { useEffect } from "react";
import Modal from "../../../components/Modal";
import {
  useCreateProductionPlan,
  useUpdateProductionPlan,
} from "../../../QueryServises/PlanQuery";
import { useLazyProductTreeSelect } from "../../../hooks/useLazyProductTreeSelect";
import { useRootProduct } from "../../../QueryServises/productQuery";
import TsLazy from "../../../components/LazyTreeSelect/LazyTreeSelect";

const STATUS_OPTIONS = [
  { value: "draft", label: "پیش‌نویس" },
  { value: "approved", label: "تأیید شده" },
  { value: "active", label: "فعال شده" },
  { value: "revised", label: "ویرایش شده" },
  { value: "closed", label: "بسته" },
];

const PlanModal = ({ isOpen, modalMode, modalData, closeModal, refetch }) => {
  const [form] = Form.useForm();
  const isEdit = modalMode === "edit";

  const { mutateAsync: addPlan, isPending: isAdding } =
    useCreateProductionPlan();
  const { mutateAsync: updatePlan, isPending: isUpdating } =
    useUpdateProductionPlan();
  const isLoading = isAdding || isUpdating;

  const { data: productData } = useRootProduct();
  const { treeData, loadChildren } = useLazyProductTreeSelect(productData);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && modalData) {
      form.setFieldsValue({
        product_id: modalData.product
          ? {
              value: modalData.product.id,
              label: modalData.product.persian_title ?? modalData.product.code,
            }
          : undefined,
        version_number: modalData.version_number,
        status: modalData.status,
        total_planned_quantity: modalData.total_planned_quantity,
        notes: modalData.notes,
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, isEdit, modalData, form]);

  const onFinish = async (values) => {
    const payload = {
      ...values,
      product_id: values.product_id?.value ?? values.product_id,
    };

    if (isEdit) {
      await updatePlan({ productionPlanId: modalData.id, ...payload });
      message.success("بروزرسانی موفقیت انجام شد.");
    } else {
      await addPlan(payload);
      message.success("باموفقیت ایجاد شد.");
    }
    refetch();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEdit ? "ویرایش برنامه تولید" : "افزودن برنامه تولید"}
      onSubmit={() => form.submit()}
      loading={isLoading}
    >
      <div className="p-1">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: "draft" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="product_id"
              label="محصول"
              rules={[{ required: true, message: "انتخاب محصول الزامی است" }]}
            >
              <TsLazy
                treeData={treeData}
                loadData={loadChildren}
                labelInValue
                placeholder="محصولات"
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="version_number"
              label="شماره نسخه"
              rules={[{ required: true, message: "شماره نسخه الزامی است" }]}
            >
              <InputNumber className="!w-full" min={0} placeholder="مثلاً ۱" />
            </Form.Item>

            <Form.Item name="status" label="وضعیت" rules={[{ required: true }]}>
              <Select options={STATUS_OPTIONS} placeholder="انتخاب وضعیت" />
            </Form.Item>

            <Form.Item
              name="total_planned_quantity"
              label="مقدار کل برنامه‌ریزی شده"
              rules={[{ required: true, message: "مقدار الزامی است" }]}
            >
              <InputNumber
                className="!w-full"
                min={0}
                placeholder="مثلاً ۵۰۰"
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

export default PlanModal;
