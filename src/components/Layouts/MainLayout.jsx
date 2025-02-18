import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import ThemeToggle from '../Theme/ThemeToggle';
import { items } from './menuItems';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [breakpointBroken, setBreakpointBroken] = useState(false);

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
        <div className="h-8 mt-2 text-center rounded bg-light-secondary dark:bg-dark-secondary">
          {!collapsed && (
            <span className="text-light-text-primary dark:text-dark-text-primary font-medium">
              نرم افزار سما
            </span>
          )}
        </div>

        <div className="absolute mt-4 w-full px-4">
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={['1']}
            className="bg-light-secondary dark:bg-dark-secondary"
            items={items}
          />
        </div>
      </Sider>

      <Layout>
        <Header className="flex items-center px-4 shadow-sm bg-light-primary dark:bg-dark-primary">
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: 'text-lg text-light-text-primary dark:text-dark-text-primary',
              onClick: () => setCollapsed(!collapsed),
            }
          )}
          <ThemeToggle />
        </Header>

        <Content className="p-4 md:p-6 min-h-[calc(100vh-64px)] bg-light-primary dark:bg-dark-primary transition-colors duration-300">
          <div className="rounded-lg p-6 bg-light-secondary dark:bg-dark-secondary">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;