import { Outlet } from 'react-router-dom';
import CustomHeader from './Header';
import Products from '../../pages/Products/Products';
import { useProductContext } from '../../Services/Context/ProductContext';

const MainLayout = () => {
  const { currentProduct } = useProductContext();

  return (
    <div className="flex flex-col h-screen bg-Main">
      {/* <div className="flex flex-col h-screen bg-[url('./bg.jpg')]"> */}
      <CustomHeader />
      <div className="grid grid-cols-[auto_1fr] h-[calc(100vh-4rem)]">
        <Products />
        <div className="w-full px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {currentProduct ? (
            <Outlet context={{ product: currentProduct }} />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-2xl">
              <p>لطفاً یک محصول را از لیست انتخاب کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;