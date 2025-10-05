import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {FolderOpenOutlined, MenuFoldOutlined} from '@ant-design/icons';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';
import {useProductContext} from '../../Services/Context/ProductContext';

const MainLayout = () => {
    const {currentProduct} = useProductContext();
    const [isProductPanelOpen, setProductPanelOpen] = useState(false);

    return (
        <div className="h-screen bg-dark-primary flex font-sans" dir="rtl">
            {isProductPanelOpen && (
                <div
                    onClick={() => setProductPanelOpen(false)}
                    className="fixed inset-0 bg-black/80 z-40"
                    aria-label="بستن پنل محصولات"
                ></div>
            )}

            <div
                className={`
                    fixed inset-y-0 right-0 z-50
                    flex h-full flex-col AeroBox 
                    overflow-hidden
                    transition-transform duration-500 ease-in-out
                    w-full max-w-sm md:max-w-md
                    border-r border-Neon-Primary/30 
                    ${isProductPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="flex justify-start p-4">
                    <button
                        onClick={() => setProductPanelOpen(false)}
                        className="p-3 text-xl text-Neon-Primary rounded-full hover:bg-Neon-Primary/20 transition-colors w-14 h-14"
                        aria-label="بستن پنل"
                    >
                        <MenuFoldOutlined/>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Products/>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="fixed top-4 right-4 z-40 transition-all duration-300">
                    <button
                        onClick={() => setProductPanelOpen(!isProductPanelOpen)}
                        className="flex items-center justify-center cursor-pointer text-Neon-Primary text-2xl
                         p-0 w-14 h-14 rounded-full AeroBox border-Neon-Primary/70 hover:scale-105 transition-transform duration-300"
                        aria-label="باز کردن پنل محصولات"
                    >
                        {isProductPanelOpen ? <MenuFoldOutlined/> : <FolderOpenOutlined/>}
                    </button>
                </div>
                <div className="fixed top-4 z-40 w-full flex justify-center pointer-events-none">
                    <div className="w-auto pointer-events-auto">
                        <CustomHeader/>
                    </div>
                </div>
                <div className="h-6"></div>
                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-dark-primary">
                    {currentProduct ? (
                        <Outlet context={{product: currentProduct}}/>
                    ) : (
                        <div className="flex items-center justify-center h-full text-dark-text-secondary text-xl">
                            <p>برای شروع، یک محصول را از لیست انتخاب کنید</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;