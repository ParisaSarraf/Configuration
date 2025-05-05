import { useState } from 'react';
import { Button, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useProductList } from "../../QueryServises/productQuery";
import ProductTree from "./components/ProductTree";
import ProductModal from "./components/ProductModal";
import { useProductContext } from '../../Services/Context/ProductContext';
import useModal from '../../hooks/useModal';

const Products = () => {
    const { data: productData, isLoading, isError, refetch } = useProductList();
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const [checkedKeys, setCheckedKeys] = useState([]);
    const { handleProductSelect } = useProductContext();

    const handleTreeChange = (newCheckedKeys) => {
        setCheckedKeys(newCheckedKeys);
    };


    return (
        <div
            className='rounded-xl mr-2 bg-white mb-2 shadow-lg shadow-purple-6 '
            style={{
                width: '300px',
                transition: 'width 0.2s',
            }}>
            <Button
                type="primary"
                onClick={() => setModal({ mode: 'add' })}
                icon={<PlusOutlined />}
                className="flex flex-row items-center m-2 px-14"
                style={{ width: '283px' }}            >
                افزودن محصول
            </Button>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Spin />
                </div>
            ) : isError ? (
                <div className="p-2 text-red-600">خطا در بارگذاری داده‌ها</div>
            ) : (
                <ProductTree
                    productData={productData}
                    setModal={setModal}
                    refetch={refetch}
                    isLoading={isLoading}
                    isError={isError}
                    checkedKeys={checkedKeys}
                    onChange={handleTreeChange}
                    onProductClick={handleProductSelect}
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
        </div>
    );
};

export default Products;