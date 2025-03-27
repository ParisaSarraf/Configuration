import { useState } from 'react';
import { Layout, Button, Spin } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import { useProductList } from "../../QueryServises/productQuery";
import ProductTree from "./components/ProductTree";
import ProductModal from "./components/ProductModal";
import useModal from "../../hooks/useModal";

const { Sider } = Layout;

const Products = () => {
    const { data: productData, isLoading, refetch } = useProductList();
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    return (
        <Sider
            width={270}
            className="bg-white dark:bg-dark-secondary fixed h-[100vh] overflow-y-scroll "
            breakpoint="lg"
        >
            <div className="p-4">
                <Button
                    type="primary"
                    onClick={() => setModal({ mode: 'create' })}
                    icon={<PlusCircleFilled />}
                    className="w-full"
                >
                    افزودن محصول
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Spin />
                </div>
            ) : (
                <ProductTree
                    productData={productData}
                    setModal={setModal}
                    refetch={refetch}
                />
            )}

            <ProductModal
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