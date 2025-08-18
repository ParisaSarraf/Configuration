import {useEffect, useState} from 'react';
import {Button, Menu, message, Spin} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {useProductList} from "../../QueryServises/productQuery";
import ProductTree from "./components/ProductTree";
import ProductModal from "./components/ProductModal";
import {useProductContext} from '../../Services/Context/ProductContext';
import useModal from '../../hooks/useModal';

const Products = () => {
    const {data: productData, isLoading, isError, refetch} = useProductList();
    const {isOpen, modalMode, modalData, setModal, closeModal} = useModal();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const {currentProduct, handleProductSelect} = useProductContext();

    useEffect(() => {
        if (currentProduct) {
            setSelectedKeys([`product-${currentProduct.id}`]);
        }
    }, [currentProduct]);


    const handleTreeChange = (newSelectedKeys) => {
        setSelectedKeys(newSelectedKeys);
    };

    return (
        <div className="h-full flex flex-col">
            <Button
                type="primary"
                onClick={() => setModal({mode: 'add'})}
                icon={<PlusOutlined/>}
                className="m-1"
            >
                افزودن محصول
            </Button>
            <div className="flex-1 overflow-y-auto mr-2">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Spin/>
                    </div>
                ) : isError ? (
                    message?.error('خطا در بارگذاری داده‌ها')
                ) : (
                    <Menu>
                        <ProductTree
                            productData={productData}
                            setModal={setModal}
                            refetch={refetch}
                            isLoading={isLoading}
                            isError={isError}
                            selectedKeys={selectedKeys}
                            onChange={handleTreeChange}
                            onProductClick={handleProductSelect}
                        />
                    </Menu>
                )}
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