import { useEffect, useState } from "react";
import { Button, Form, message, Modal, Spin } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useRootProduct,
  useUpdateWarehouseStock,
} from "../../QueryServises/productQuery";
import ProductTree from "./components/ProductTree";
import ProductModal from "./components/ProductModal";
import { useProductContext } from "../../Services/Context/ProductContext";
import useModal from "../../hooks/useModal";
import FileUploader from "../../components/FileUploader/FileUploader";

const ProductListSkeleton = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
    <p className="mb-4">درحال بارگذاری محصولات</p>
    <Spin />
  </div>
);

const ErrorDisplay = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
    <p className="mb-4">خطا در بارگذاری محصولات</p>
    <Button icon={<ReloadOutlined />} onClick={onRetry}>
      تلاش مجدد
    </Button>
  </div>
);

const Products = () => {
  const { data: productData, isFetching, isError, refetch } = useRootProduct();
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const { currentProduct, handleProductSelect } = useProductContext();
  const { mutateAsync: fileUpdateWarehouseStock } = useUpdateWarehouseStock();
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentProduct) {
      setSelectedKeys([String(currentProduct.id)]);
    }
  }, [currentProduct]);

  const handleTreeChange = (newSelectedKeys) => {
    setSelectedKeys(newSelectedKeys);
  };

  const renderContent = () => {
    if (isError) {
      return <ErrorDisplay onRetry={refetch} />;
    }
    return (
      <ProductTree
        productData={productData}
        setModal={setModal}
        refetch={refetch}
        isLoading={isFetching}
        isError={isError}
        selectedKeys={selectedKeys}
        onChange={handleTreeChange}
        onProductClick={handleProductSelect}
      />
    );
  };

  const handleUpdateWarehouseStock = () => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2 text-lg font-semibold">
          📦 بروزرسانی موجودی انبار
        </div>
      ),
      width: 520,
      centered: true,
      okText: "آپلود و بروزرسانی",
      cancelText: "انصراف",
      okType: "primary",
      content: (
        <div className="mt-4 space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
            آیا از آپلود فایل و بروزرسانی موجودی انبار اطمینان دارید؟
          </div>

          <Form form={form} layout="vertical">
            <Form.Item
              label="فایل CSV"
              name="csv_file"
              rules={[{ required: true, message: "فایل را انتخاب کنید." }]}
            >
              <FileUploader />
            </Form.Item>
          </Form>
        </div>
      ),
      onOk: async () => {
        try {
          const values = await form.validateFields();
          const csvFile = values.csv_file?.[0]?.originFileObj;
          await fileUpdateWarehouseStock({ csv_file: csvFile });
          message.success("بروزرسانی موجودی انبار با موفقیت انجام شد.");
          form.resetFields();
          await refetch();
        } catch (error) {
          const errorData = error.response?.data;
          let errorMessage = "خطایی رخ داده است.";
          if (Array.isArray(errorData)) {
            errorMessage = errorData.join("\n");
          } else if (Array.isArray(errorData?.detail)) {
            errorMessage = errorData.detail.join("\n");
          } else if (typeof errorData?.detail === "string") {
            errorMessage = errorData.detail;
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (error.message) {
            errorMessage = error.message;
          }
          message.error(errorMessage);
          throw error;
        }
      },
      onCancel: () => {
        form.resetFields();
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-white p-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">محصولات</h2>
        <div className="flex flex-row gap-2">
          <Button
            type="primary"
            shape="round"
            onClick={() => setModal({ mode: "add" })}
            icon={<PlusOutlined />}
            title="افزودن محصول"
          />
          <Button
            type="primary"
            shape="round"
            onClick={handleUpdateWarehouseStock}
            icon={<ReloadOutlined />}
            title="بروزرسانی موجودی انبار"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar">
        {isFetching ? <ProductListSkeleton /> : renderContent()}
      </div>

      <ProductModal
        productData={productData}
        isOpen={isOpen}
        modalMode={modalMode}
        modalData={modalData}
        closeModal={closeModal}
        setModal={setModal}
        refetch={refetch}
      />
    </div>
  );
};

export default Products;
