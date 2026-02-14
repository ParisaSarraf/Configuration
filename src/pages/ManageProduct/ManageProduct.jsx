import { ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const ManageProduct = () => {
  const navigate = useNavigate();

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-none">
                مدیریت محصولات
              </h1>
              <p className="mt-3 text-slate-500 text-lg">
                مدیریت محصولات و مشاهده محصولات مخفی شده
              </p>
            </div>
          </div>
        </header>
        <main>
         
        </main>
      </div>
    </div>
  );
};

export default ManageProduct;
