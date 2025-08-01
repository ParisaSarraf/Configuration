import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {DoubleLeftOutlined, DoubleRightOutlined} from '@ant-design/icons';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';
import {useProductContext} from '../../Services/Context/ProductContext';

const MainLayout = () => {
    const {currentProduct} = useProductContext();
    const [isProductsCollapsed, setIsProductsCollapsed] = useState(false);

    const toggleProductsPanel = () => {
        setIsProductsCollapsed(!isProductsCollapsed);
    };

    return (
        <div className="flex flex-col h-screen bg-Main">
            <CustomHeader/>
            <div className="flex h-[calc(100vh-4rem)]">
                <div
                    className={`bg-white transition-all duration-300 ease-in-out ${isProductsCollapsed ? 'w-0 overflow-hidden' : 'w-[360px]'}`}>
                    <Products/>
                </div>

                {/* Collapse Button */}
                <button
                    onClick={toggleProductsPanel}
                    className={`bg-white rounded-l-md  ${isProductsCollapsed ? 'left-0' : 'left-[360px]'}`}
                >
                    {isProductsCollapsed ? <DoubleRightOutlined/> : <DoubleLeftOutlined/>}
                </button>

                {/* Main Content */}
                <div
                    className="flex-1 px-2 overflow-y-auto "
                >
                    {currentProduct ? (
                        <Outlet context={{product: currentProduct}}/>
                    ) : (
                        <div className="flex items-center justify-center h-full text-white text-2xl">
                            <p>لطفاً یک محصول را از لیست انتخاب کنید</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;