import { Form, message } from "antd";
import Modal from "../Modal";
import TextArea from "antd/es/input/TextArea";
import { useUpdateProductPurchase } from "../../QueryServises/productPurchase";
import { useEffect } from "react";
import { useUpdateRequestOfWarehouse } from "../../QueryServises/RequestOfWarehouse";

const ExportPurchaseExcelModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  refetch,
  onExportSuccess,
}) => {
  const [form] = Form.useForm();
  const { mutateAsync: updateProductPurchase, isLoading: isUpdating } =
    useUpdateProductPurchase();
  const { mutateAsync: updateWarehouse, isLoading: isUpdatingWarehouse } =
    useUpdateRequestOfWarehouse();

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  const onFinish = async (values) => {
    try {
      if (modalMode === "exportExcelWareHouse") {
        await updateWarehouse({
          RequestOfWarehouseId: modalData,
          excel_description: values.excel_description,
        });
      } else {
        await updateProductPurchase({
          productPurchaseId: modalData,
          excel_description: values.excel_description,
        });
      }
      message.success("دلیل خروجی اکسل با موفقیت ثبت شد");
      if (onExportSuccess) {
        onExportSuccess(modalData);
      }
      await refetch();

      closeModal();
    } catch (error) {
      console.error("Update error:", error);
      message.error("ثبت دلیل خروجی اکسل با خطا مواجه شد");
    }
  };

  const handleSubmit = () => {
    form.submit();
  };

  return (
    <Modal
      isOpen={isOpen}
      size={500}
      title={"ثبت دلیل خروجی اکسل"}
      onClose={closeModal}
      onSubmit={handleSubmit}
      footerButtons={[
        {
          text: "انصراف",
          onClick: closeModal,
          type: "default",
        },
        {
          text: "ذخیره",
          onClick: handleSubmit,
          type: "primary",
          loading: isUpdating || isUpdatingWarehouse,
        },
      ]}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="توضیحات خروجی اکسل"
          name="excel_description"
          rules={[
            {
              required: true,
              message: "لطفاً دلیل خروجی اکسل را وارد کنید",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="دلیل درخواست خروجی اکسل را وارد کنید..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="text-sm text-gray-500 mb-4">
          <p>• پس از ثبت دلیل، فایل اکسل به صورت خودکار دانلود می‌شود.</p>
          <p>• این توضیحات در تاریخچه درخواست‌ها ثبت خواهد شد.</p>
        </div>
      </Form>
    </Modal>
  );
};

export default ExportPurchaseExcelModal;
