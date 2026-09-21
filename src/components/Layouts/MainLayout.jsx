import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';
import {useProductContext} from '../../Services/Context/ProductContext';

const MainLayout = () => {
    const {currentProduct} = useProductContext();
    const [isSidebarOpen, setSidebarOpen] = useState(
        () => typeof window !== 'undefined' && window.innerWidth >= 1024
    );

    return (
        <div className="app-shell h-[100dvh] flex gap-0 lg:gap-2 lg:p-2 font-sans" dir="rtl">
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
                    app-sidebar flex h-full flex-col bg-white
                    overflow-hidden
                    transition-all duration-300 ease-in-out
                    w-[min(82vw,18rem)]
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                    lg:translate-x-0
                    ${isSidebarOpen ? 'lg:w-80 xl:w-96' : 'lg:w-0'}
                `}
            >
                <div className="flex-1 overflow-hidden">
                    {isSidebarOpen && <Products/>}
                </div>

            </aside>

            <div className="app-workspace min-w-0 flex-1 flex flex-col overflow-hidden lg:rounded-2xl">
                <CustomHeader>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="app-icon-button text-lg text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {isSidebarOpen ? <MenuFoldOutlined/> : <MenuUnfoldOutlined/>}
                    </button>
                </CustomHeader>

                <main className="app-main flex-1 min-w-0 p-2 sm:p-3 lg:p-4 overflow-y-auto overflow-x-hidden">
                    {currentProduct ? (
                        <Outlet context={{product: currentProduct}}/>
                    ) : (
                        <div className="flex items-center justify-center h-full px-4 text-center text-slate-500 text-base sm:text-lg">
                            <p>برای شروع، یک محصول را از لیست انتخاب کنید</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
