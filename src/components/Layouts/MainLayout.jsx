import {useEffect, useRef, useState} from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import {Button, ConfigProvider, Drawer} from 'antd';
import {MenuFoldOutlined, MenuUnfoldOutlined, InboxOutlined} from '@ant-design/icons';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';
import {useProductContext} from '../../Services/Context/ProductContext';
import {useProductTheme} from '../Theme/ProductThemeContext';
import {getProductThemeConfig, getProductThemeVariables} from '../Theme/productThemes';
import '../ProductUI/product-workspace.css';

const MainLayout = () => {
    const {currentProduct} = useProductContext();
    const {globalTheme} = useProductTheme();
    const themeVariables = getProductThemeVariables(globalTheme);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileOpen, setMobileOpen] = useState(false);
    const toggleRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
    }, [currentProduct?.id, location.pathname]);

    // Do not keep a modal drawer open when switching to the desktop layout.
    useEffect(() => {
        const media = window.matchMedia('(min-width: 1024px)');
        const handleChange = (event) => {
            if (event.matches) setMobileOpen(false);
        };
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const toggleSidebar = () => {
        if (window.matchMedia('(min-width: 1024px)').matches) {
            setSidebarOpen((open) => !open);
        } else {
            setMobileOpen((open) => !open);
        }
    };

    return (
        <ConfigProvider theme={getProductThemeConfig(globalTheme)}>
            <div className="product-workspace" data-theme={globalTheme} dir="rtl">
                <aside className={`pw-sidebar ${isSidebarOpen ? '' : 'pw-sidebar--collapsed'}`} aria-label="فهرست محصولات">
                    {isSidebarOpen && <Products/>}
                </aside>
                <Drawer
                    className="pw-mobile-drawer"
                    title="فهرست محصولات"
                    placement="right"
                    width="min(340px, 90vw)"
                    open={isMobileOpen}
                    onClose={() => setMobileOpen(false)}
                    afterOpenChange={(open) => { if (!open) toggleRef.current?.focus(); }}
                    destroyOnClose
                    rootStyle={themeVariables}
                >
                    {isMobileOpen && <Products onSelect={() => setMobileOpen(false)}/>}
                </Drawer>
                <div className="pw-main">
                    <CustomHeader>
                        <Button
                            ref={toggleRef}
                            onClick={toggleSidebar}
                            className="pw-sidebar-toggle"
                            aria-label="باز و بسته کردن فهرست محصولات"
                            icon={isSidebarOpen ? <MenuFoldOutlined/> : <MenuUnfoldOutlined/>}
                        />
                    </CustomHeader>
                    <main className="pw-content" id="main-content">
                        {currentProduct ? <Outlet context={{product: currentProduct}}/> : (
                            <section className="pw-empty" aria-live="polite">
                                <InboxOutlined/>
                                <h1>مدیریت یکپارچه محصول</h1>
                                <p>برای شروع، یک محصول را از فهرست انتخاب کنید.</p>
                                <Button className="pw-mobile-only" onClick={() => setMobileOpen(true)}>انتخاب محصول</Button>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default MainLayout;
