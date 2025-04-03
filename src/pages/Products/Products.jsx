import { useState } from 'react';
import { Layout, Button, Spin } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import { useProductList } from "../../QueryServises/productQuery";
import ProductTree from "./components/ProductTree";
import ProductModal from "./components/ProductModal";
import useModal from "../../hooks/useModal";

const { Sider } = Layout;

const Products = () => {
    const { data: productData, isLoading, isError, refetch } = useProductList();
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const [checkedKeys, setCheckedKeys] = useState([]);

    const handleTreeChange = (newCheckedKeys) => {
        setCheckedKeys(newCheckedKeys);
    };

    return (
        <Sider
            width={300}
            className="bg-white dark:bg-dark-secondary fixed h-[100vh] overflow-y-scroll"
            breakpoint="lg"
            collapsedWidth={0}
        >
            <div className="p-4">
                <Button
                    type="primary"
                    onClick={() => setModal({ mode: 'add' })}
                    icon={<PlusCircleFilled />}
                    className="w-full hidden md:block"
                >
                    افزودن محصول
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Spin />
                </div>
            ) : isError ? (
                <div className="p-4 text-red-500">خطا در بارگذاری داده‌ها</div>
            ) : (
                <ProductTree
                    productData={productData}
                    setModal={setModal}
                    refetch={refetch}
                    isLoading={isLoading}
                    isError={isError}
                    checkedKeys={checkedKeys}
                    onChange={handleTreeChange}
                />
            )}
            <ProductModal
                productData={productData}
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                setModal={setModal}
                refetch={refetch}
            />
        </Sider>
    );
};

export default Products;