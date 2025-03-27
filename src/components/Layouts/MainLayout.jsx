import { Card, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';

const { Content } = Layout;
const MainLayout = () => {

  return (
    <Layout className="min-h-full max-h-full">
      <CustomHeader />
      <Layout className='w-full flex flex-col'>
        <Products />
        <Content className='mt-4 min-h-[calc(100vh-60px)] '>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;