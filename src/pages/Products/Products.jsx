import { useState } from 'react';
import { Layout, Button, Spin } from 'antd';
import { PlusCircleFilled, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useProductList } from "../../QueryServises/productQuery";
import ProductTree from "./components/ProductTree";
import ProductModal from "./components/ProductModal";
import useModal from "../../hooks/useModal";

const { Sider, Content } = Layout;

const Products = () => {
    const { data: productData = [], isLoading, refetch } = useProductList();
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout hasSider className="min-h-screen">
            <Sider
                width={250}
                collapsed={collapsed}
                collapsible
                onCollapse={setCollapsed}
                className="bg-white dark:bg-dark-secondary !important"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    left: 0,
                }}
                breakpoint="lg"
                collapsedWidth="0"
            >
                <div className="p-4 flex justify-between items-center">
                    {!collapsed && <span className="font-bold">منو</span>}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                    />
                </div>

                <div className="p-4">
                    <Button
                        type="primary"
                        onClick={() => setModal({ mode: 'create' })}
                        icon={<PlusCircleFilled />}
                        className="w-full"
                    >
                        {!collapsed && 'افزودن محصول'}
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
            </Sider>
            <ProductModal
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                setModal={setModal}
                refetch={refetch}
            />
        </Layout>
    );
};

export default Products;