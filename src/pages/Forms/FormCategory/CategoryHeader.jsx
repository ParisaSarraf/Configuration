import { ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { FileStack, FolderTree } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoryHeader = ({ refetch, totalCategories = 0, totalForms = 0 }) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        type="text"
        icon={<ArrowRightOutlined />}
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-slate-600 hover:!text-blue-600 dark:text-slate-300"
      >
        بازگشت به صفحه قبل
      </Button>

      <header className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-l from-blue-500 to-sky-600 p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-xl font-extrabold text-white sm:text-2xl">
              مدیریت فرم‌ها
            </h1>
            <p className="mt-1 mb-0 text-xs leading-7 text-blue-50 sm:text-sm">
              فرم‌های سازمانی را دسته‌بندی، طراحی و برای استفاده در فرایندها
              آماده کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-h-10 items-center gap-2 rounded-xl bg-white/15 px-3 text-white ring-1 ring-white/20">
              <FolderTree size={16} />
              <span className="text-xs">دسته‌بندی‌ها</span>
              <strong>{totalCategories.toLocaleString("fa-IR")}</strong>
            </div>
            <div className="flex min-h-10 items-center gap-2 rounded-xl bg-white/15 px-3 text-white ring-1 ring-white/20">
              <FileStack size={16} />
              <span className="text-xs">فرم‌ها</span>
              <strong>{totalForms.toLocaleString("fa-IR")}</strong>
            </div>
            <Tooltip title="بارگذاری مجدد">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => refetch?.()}
                className="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl !bg-white !text-blue-600 hover:!bg-blue-50"
              />
            </Tooltip>
          </div>
        </div>
      </header>
    </>
  );
};

export default CategoryHeader;
