import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  UserOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ThemeToggle from '../Theme/ThemeToggle';

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
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          className="bg-light-secondary dark:bg-dark-secondary"
          items={[
            {
              key: '1',
              icon: <HomeOutlined className="text-light-text-primary dark:text-dark-text-primary" />,
              label: (
                <Link
                  to="/"
                  className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent"
                >
                  Home
                </Link>
              ),
            },
            {
              key: '2',
              icon: <DashboardOutlined className="text-light-text-primary dark:text-dark-text-primary" />,
              label: (
                <Link
                  to="/dashboard"
                  className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent"
                >
                  Dashboard
                </Link>
              ),
            },
            {
              key: '3',
              icon: <UserOutlined className="text-light-text-primary dark:text-dark-text-primary" />,
              label: (
                <Link
                  to="/about"
                  className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent"
                >
                  About
                </Link>
              ),
            },
          ]}
        />

        <div className="absolute bottom-4 w-full ">
          <ThemeToggle />
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