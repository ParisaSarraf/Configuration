import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';
import {useProductContext} from '../../Services/Context/ProductContext';

const MainLayout = () => {
    const {currentProduct} = useProductContext();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="h-screen bg-slate-100 flex font-sans" dir="rtl">
            {isSidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    aria-label="Close sidebar"
                ></div>
            )}

            <aside
                className={`
                    fixed lg:relative inset-y-0 right-0 z-40
                    flex h-full flex-col bg-white shadow-lg
                    overflow-hidden
                    transition-all duration-300 ease-in-out
                    w-72
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                    lg:translate-x-0
                    ${isSidebarOpen ? 'lg:w-96' : 'lg:w-0'}
                `}
            >
                <div className="flex-1 overflow-hidden">
                    {isSidebarOpen && <Products/>}
                </div>

            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <CustomHeader>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-xl text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {isSidebarOpen ? <MenuFoldOutlined/> : <MenuUnfoldOutlined/>}
                    </button>
                </CustomHeader>

                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {currentProduct ? (
                        <Outlet context={{product: currentProduct}}/>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-xl">
                            <p>برای شروع، یک محصول را از لیست انتخاب کنید</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;