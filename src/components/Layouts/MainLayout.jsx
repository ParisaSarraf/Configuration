import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet } from 'react-router-dom';
import CustomHeader from './Header';
import { items } from './menuItems';

const { Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [breakpoint, setBreakpoint] = useState('md');

  const getSiderWidth = () => {
    switch (breakpoint) {
      case 'xs': return collapsed ? 0 : 200;
      case 'sm': return collapsed ? 0 : 220;
      case 'md': return collapsed ? 80 : 240;
      case 'lg': return collapsed ? 100 : 260;
      case 'xl': return collapsed ? 120 : 280;
      default: return collapsed ? 0 : 80;
    }
  };

  return (
    <Layout className="min-h-full max-h-full transition-colors duration-300">
      <Sider
        breakpoint="md"
        collapsedWidth={0}
        collapsible
        collapsed={collapsed}
        onBreakpoint={(broken) => setBreakpoint(broken ? 'xs' : 'md')}
        trigger={null}
        className={`bg-[#FFFFFF] dark:bg-dark-secondary mr-4 my-4  ${!collapsed ? '' : ''
          }`}
        width={getSiderWidth()}
      >
        <div className="my-8 text-center bg-[#FFFFFF] dark:bg-dark-secondary">
          {!collapsed && (
            <span className="font-bold text-light-text-primary dark:text-dark-text-primary text-lg">
              مدیریت پیکربندی
            </span>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          className="bg-[#FFFFFF] dark:bg-dark-secondary"
          items={items}
        />
      </Sider>
      <Layout>
        <CustomHeader collapsed={collapsed} setCollapsed={setCollapsed} />
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