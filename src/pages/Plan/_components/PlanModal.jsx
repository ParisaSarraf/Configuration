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
import { useContractorProductList } from "../../../QueryServises/ProductContractorQuery";

const STATUS_OPTIONS = [
  { value: "draft", label: "پیش‌نویس" },
  { value: "approved", label: "تأیید شده" },
  { value: "active", label: "تکمیل شده" },
  { value: "revised", label: "لغو و بازبینی" },
  { value: "closed", label: "لغو و بسته" },
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
  const { data: contractorData } = useContractorProductList();

  useEffect(() => {
    if (!isOpen) return;
    console.log(modalData);

    if (isEdit && modalData) {
      form.setFieldsValue({
        product_id: modalData.product
          ? {
              value: modalData.product.id,
              label: modalData.product.persian_title ?? modalData.product.code,
            }
          : undefined,
        // version_number: modalData.version_number,
        product_name: modalData.product_name,
        contractor_id: modalData.contractor_id
          ? {
              value: modalData.contractor_id,
              label:
                modalData.contractor_id.persian_title ??
                modalData.contractor_id.code,
            }
          : undefined,
        status: modalData.status,
        product_name: modalData.product_name,
        year: modalData.year,
        weight: modalData.weight,
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
      product_name: values.product_name,
      contractor_id: values.contractor_id,
    };

    try {
      if (isEdit) {
        await updatePlan({ productionPlanId: modalData.id, ...payload });
        message.success("بروزرسانی با موفقیت انجام شد.");
      } else {
        await addPlan(payload);
        message.success("با موفقیت ایجاد شد.");
      }
      refetch();
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.detail ?? "خطا در ثبت برنامه تولید");
      console.error(error);
    }
  };

  const contractorsData =
    contractorData?.filter((item) => item.is_employer === false) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEdit ? "ویرایش برنامه تولید" : "افزودن برنامه تولید"}
      onSubmit={() => form.submit()}
      loading={isLoading}
      size={500}
    >
      <div className="p-1">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: "draft" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-4">
            <Form.Item name="product_id" label="محصول">
              <TsLazy
                treeData={treeData}
                loadData={loadChildren}
                labelInValue
                placeholder="محصولات"
                allowClear
              />
            </Form.Item>

            <Form.Item name={"product_name"} label="نام محصول">
              <Input placeholder="نام محصول" />
            </Form.Item>

            <Form.Item name={"contractor_id"} label="پیمانکار">
              <Select
                options={contractorsData.map((item) => ({
                  value: item.id,
                  label: item.persian_title ?? item.code,
                }))}
                placeholder="پیمانکار"
                allowClear={true}
              />
            </Form.Item>

            <Form.Item name={"weight"} label="وزن">
              <Input placeholder="وزن" />
            </Form.Item>

            <Form.Item name={"year"} label="سال">
              <InputNumber placeholder="سال" className="w-full" />
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
