import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet } from 'react-router-dom';
import { items } from './menuItems';
import CustomHeader from './Header';

const { Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [breakpointBroken, setBreakpointBroken] = useState(false);
  const [theme, setTheme] = useState('light'); // Added theme state

  return (
    <Layout className="min-h-screen transition-colors duration-300">
      <Sider
        breakpoint="md"
        collapsedWidth={breakpointBroken ? 0 : 80}
        collapsible
        collapsed={collapsed}
        onBreakpoint={(broken) => setBreakpointBroken(broken)}
        trigger={null}
        className="shadow-lg bg-light-secondary dark:bg-dark-secondary"
      >
        <div className="h-4 my-8 text-center rounded bg-light-secondary dark:bg-dark-secondary">
          {!collapsed && (
            <span className="font-medium text-light-text-primary dark:text-dark-text-primary text-lg">
              Configuration Project
            </span>
          )}
        </div>
        <Menu
          theme={theme}
          mode="inline"
          defaultSelectedKeys={['1']}
          className="bg-light-secondary dark:bg-dark-secondary"
          items={items}
        />
      </Sider>
      <Layout>
        <CustomHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <Content className="p-4 md:p-6 min-h-[calc(100vh-64px)] bg-light-primary dark:bg-dark-primary transition-colors duration-300">
          <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 p-6 rounded-lg">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
