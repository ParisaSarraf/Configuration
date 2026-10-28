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
    <div className="system-management-page min-h-screen theme-canvas p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="themed-page-header mb-6">
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate("/panel/system-management")}
            className="flex items-center theme-muted hover:!theme-accent mb-4 font-medium"
          >
            بازگشت به مدیریت سیستم
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black theme-text leading-none">
                مدیریت محصولات
              </h1>
              <p className="mt-3 theme-muted text-lg">
                مشاهده ساختار درختی و محصولات مخفی
              </p>
            </div>

            <div className="theme-surface p-3 rounded-lg shadow-sm flex items-center gap-3 border theme-border">
              <span className="theme-text font-medium">
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
