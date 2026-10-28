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
        onClick={() => navigate("/")}
        className="mb-4 flex items-center theme-muted hover:!theme-accent dark:theme-muted"
      >
        بازگشت به صفحه قبل
      </Button>

      <header className="themed-page-header mb-4 overflow-hidden rounded-2xl bg-gradient-to-l theme-gradient p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-xl font-extrabold theme-on-accent sm:text-2xl">
              مدیریت فرم‌ها
            </h1>
            <p className="mt-1 mb-0 text-xs leading-7 theme-accent sm:text-sm">
              فرم‌های سازمانی را دسته‌بندی، طراحی و برای استفاده در فرایندها
              آماده کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-h-10 items-center gap-2 rounded-xl theme-surface-15 px-3 theme-on-accent ring-1 theme-ring-border-20">
              <FolderTree size={16} />
              <span className="text-xs">دسته‌بندی‌ها</span>
              <strong>{totalCategories.toLocaleString("fa-IR")}</strong>
            </div>
            <div className="flex min-h-10 items-center gap-2 rounded-xl theme-surface-15 px-3 theme-on-accent ring-1 theme-ring-border-20">
              <FileStack size={16} />
              <span className="text-xs">فرم‌ها</span>
              <strong>{totalForms.toLocaleString("fa-IR")}</strong>
            </div>
            <Tooltip title="بارگذاری مجدد">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => refetch?.()}
                className="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl !theme-surface !theme-accent hover:!theme-accent-soft"
              />
            </Tooltip>
          </div>
        </div>
      </header>
    </>
  );
};

export default CategoryHeader;
