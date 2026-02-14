import { useEffect, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, Switch, Spin, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { useRootProduct } from "../../../QueryServises/productQuery";
import { useProductContext } from "../../../Services/Context/ProductContext";
import ManageProductTree from "./ManageProductTree";

const ManageProduct = () => {
  const navigate = useNavigate();
  const [showHidden, setShowHidden] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [setModal] = useState(null);

  const {
    data: productData,
    isLoading: isRootLoading,
    isFetching,
    refetch,
    isError,
  } = useRootProduct(showHidden);

  const { currentProduct, handleProductSelect } = useProductContext();

  useEffect(() => {
    if (currentProduct) {
      setSelectedKeys([`product-${currentProduct.id}`]);
    }
  }, [currentProduct]);

  const handleTreeChange = (newSelectedKeys) => {
    setSelectedKeys(newSelectedKeys);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header>
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate("/panel/system-management")}
            className="flex items-center text-slate-600 hover:!text-sky-700 mb-4 font-medium"
          >
            بازگشت به مدیریت سیستم
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-none">
                مدیریت محصولات
              </h1>
              <p className="mt-3 text-slate-500 text-lg">
                مشاهده ساختار درختی و محصولات مخفی
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3 border border-slate-200">
              <span className="text-slate-700 font-medium">
                نمایش آیتم‌های مخفی:
              </span>
              <Switch
                checked={showHidden}
                onChange={setShowHidden}
                checkedChildren="غیرفعال"
                unCheckedChildren="فعال"
              />
            </div>
          </div>
        </header>

        <main>
          <Card className="shadow-md border-0">
            {isRootLoading ? (
              <div className="flex justify-center py-12">
                <Spin tip="در حال بارگذاری..." size="large" />
              </div>
            ) : productData && productData.length > 0 ? (
              <ManageProductTree
                productData={productData}
                setModal={setModal}
                refetch={refetch}
                isLoading={isFetching}
                isError={isError}
                selectedKeys={selectedKeys}
                onChange={handleTreeChange}
                onProductClick={handleProductSelect}
                showHidden={showHidden}
              />
            ) : (
              <Empty description="محصولی یافت نشد" />
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ManageProduct;
