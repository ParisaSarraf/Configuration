import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Spin } from "antd";
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
      title: "آیا مطمئن هستید؟",
      okText: "بله",
      okType: "primary",
      content: (
        <Form form={form}>
          <Form.Item label="فایل" name="csv_file" rules={[{ required: true }]}>
            <FileUploader />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const values = await form.validateFields();
        const csvFile = values.csv_file?.[0]?.originFileObj;
        console.log(csvFile);
        try {
          await fileUpdateWarehouseStock({ csv_file: csvFile });
          message.success("بروزرسانی موجودی انبار با موفقیت انجام شد");
          form.resetFields();
          await refetch();
        } catch (error) {
          message.error(error.message);
          return Promise.reject(error);
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
