import { Outlet } from 'react-router-dom';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';
import { useProductContext } from '../../Services/ProductContext';

const MainLayout = () => {
  const { currentProduct } = useProductContext();

  return (
    <div className="flex flex-col h-full bg-Main">
      <CustomHeader />
      <div className="grid grid-cols-[auto_1fr] h-[calc(100dvh-4rem)]">
        <Products />
        <div className="w-full px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Outlet context={{ product: currentProduct }} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;