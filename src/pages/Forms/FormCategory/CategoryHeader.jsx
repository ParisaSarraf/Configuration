const CategoryHeader = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
        <div>
          <h1 className="text-lg font-bold text-gray-800 m-0 leading-tight">
            مدیریت فرم‌ها
          </h1>
        </div>
      </div>
    </header>
  );
};

export default CategoryHeader;
