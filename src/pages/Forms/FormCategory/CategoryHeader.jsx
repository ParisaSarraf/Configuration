import { ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { FileStack, FolderTree, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoryHeader = ({ refetch, totalCategories = 0, totalForms = 0 }) => {
  const navigate = useNavigate();

  return (
    <header className="relative mb-6 overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-l from-sky-600 via-indigo-600 to-violet-600 px-6 py-5 shadow-lg shadow-indigo-200/60">
      {/* حباب‌های تزئینی پس‌زمینه */}
      <div className="pointer-events-none absolute -top-16 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 right-16 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner ring-1 ring-white/30 backdrop-blur">
            <FileStack size={22} />
          </div>

          <div>
            <h1 className="m-0 flex items-center gap-2 text-xl font-black leading-tight text-white">
              مدیریت فرم‌ها
              <Sparkles size={16} className="text-amber-300" />
            </h1>
            <p className="m-0 mt-1 text-[12px] text-white/80">
              دسته‌بندی، ساخت و پیش‌نمایش فرم‌های سازمانی
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-white ring-1 ring-white/25 backdrop-blur">
            <FolderTree size={16} className="text-sky-200" />
            <span className="text-[11px] text-white/80">دسته‌بندی‌ها</span>
            <span className="rounded-lg bg-white/25 px-2 py-0.5 text-xs font-bold">
              {totalCategories}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-white ring-1 ring-white/25 backdrop-blur">
            <FileStack size={16} className="text-emerald-200" />
            <span className="text-[11px] text-white/80">فرم‌ها</span>
            <span className="rounded-lg bg-white/25 px-2 py-0.5 text-xs font-bold">
              {totalForms}
            </span>
          </div>

          <Tooltip title="بارگذاری مجدد">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => refetch?.()}
              className="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl !bg-white/15 !text-white hover:!bg-white/25"
            />
          </Tooltip>

          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate("/")}
            className="!flex !h-10 !items-center !rounded-xl !bg-white !px-4 !font-semibold !text-indigo-700 shadow-sm hover:!bg-indigo-50 hover:!text-indigo-800"
          >
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CategoryHeader;
