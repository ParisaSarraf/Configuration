// src/components/MainLayout.jsx
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, Switch, theme } from 'antd';

const { Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { token: { colorBgContainer } } = theme.useToken();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
        },
      }}
    >
      <Layout className="min-h-screen">
        <Sider
          className="fixed left-0 top-0 h-screen z-50"
          style={{
            background: colorBgContainer,
          }}
        >
          <div className="p-4 flex items-center justify-between">
            <span className="text-indigo-500 font-bold">Logo</span>
            <Switch
              checkedChildren="🌙"
              unCheckedChildren="☀️"
              checked={isDarkMode}
              onChange={(checked) => setIsDarkMode(checked)}
              className="bg-gray-200 dark:bg-gray-600"
            />
          </div>
          
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            // items={/* آیتم‌های منو */}
            className="border-0 h-[calc(100vh-64px)]"
          />
        </Sider>

        <Content className="ml-[200px] p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {children}
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;