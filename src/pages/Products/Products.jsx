import {useEffect, useState} from 'react';
import {Button} from 'antd';
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';
import {useProductList} from "../../QueryServises/productQuery";
import ProductTree from "./components/ProductTree";
import ProductModal from "./components/ProductModal";
import {useProductContext} from '../../Services/Context/ProductContext';
import useModal from '../../hooks/useModal';

const ProductListSkeleton = () => (
    <div className="space-y-3 mt-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 space-x-reverse">
                <div className="h-5 w-5 bg-slate-200 rounded-md"></div>
                <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
            </div>
        ))}
    </div>
);

const ErrorDisplay = ({onRetry}) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
        <p className="mb-4">خطا در بارگذاری محصولات</p>
        <Button icon={<ReloadOutlined/>} onClick={onRetry}>
            تلاش مجدد
        </Button>
    </div>
);


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

    const renderContent = () => {
        if (isLoading) {
            return <ProductListSkeleton/>;
        }
        if (isError) {
            return <ErrorDisplay onRetry={refetch}/>;
        }
        return (
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
        );
    };

    return (
        <div className="h-full flex flex-col bg-white p-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">محصولات</h2>
                <Button
                    type="primary"
                    shape="round"
                    onClick={() => setModal({mode: 'add'})}
                    icon={<PlusOutlined/>}
                >
                    افزودن
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar">
                {renderContent()}
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