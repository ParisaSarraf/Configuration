import { Outlet } from 'react-router-dom';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <CustomHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block h-full overflow-y-auto w-64 lg:w-72 shrink-0">
          <Products />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:ml-4">
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;