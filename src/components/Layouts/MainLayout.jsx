import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import CustomHeader from './Header';
import { items } from './menuItems';
import Products from '../../pages/Products/Products';

const { Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout className="min-h-full max-h-full transition-colors duration-300">
      <Layout>

        <CustomHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Products />
        <Content className="p-4 md:p-6 min-h-[calc(100vh-64px)] bg-light-primary dark:bg-dark-primary transition-colors duration-300">
          <div>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;