import { useEffect, useRef, useState } from "react";
import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  EyeOutlined,
  FileTextOutlined,
  InboxOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  FileAddFilled,
  CaretUpOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

import Introduction from "../Introduction/Introduction";
import ProductTracking from "../ProductTracking/ProductTracking";
import Experience from "../Experience/Experience";
import ProductRequirement from "../ProductRequirement/ProductRequirement";
import ProductPurchase from "../productPurchase/ProductPurchase";
import RequestOfWarehouse from "@/pages/RequestOfWarehouse/RequestOfWarehouse.jsx";
import Meetings from "@/pages/Meetings/Meetings.jsx";
import Activity from "@/pages/Activity/Activity.jsx";
import ProductDocuments from "../ProductDocument/ProductDocuments";
import Reports from "@/pages/Reports/Reports.jsx";
import DetailAccessProduct from "@/pages/SystemManagement/DetailAccessProduct/DetailAccessProduct.jsx";
import { useProductContext } from "../../Services/Context/ProductContext";
import { useAccessOfUserByProductIdList } from "../../QueryServises/accsessQuery";

const GoodsCategories = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const [showAccessDetails, setShowAccessDetails] = useState(false); 

  const tabsContainerRef = useRef(null);
  const tabRefs = useRef([]);

  const { currentProduct } = useProductContext();
  const { data: accessList } = useAccessOfUserByProductIdList(
    currentProduct?.id
  );

  const tabs = [
    {
      id: "1",
      label: "معرفی و مشخصات",
      icon: <AppstoreOutlined />,
      content: <Introduction />,
      color:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200",
    },
    {
      id: "2",
      label: "ردیابی محصول",
      icon: <EyeOutlined />,
      content: <ProductTracking />,
      color:
        "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200",
    },
    {
      id: "3",
      label: "اسناد و لاگ ها",
      icon: <FileTextOutlined />,
      content: <ProductDocuments />,
      color:
        "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200",
    },
    {
      id: "4",
      label: "الزامات و وابستگی ها",
      icon: <LinkOutlined />,
      content: <ProductRequirement />,
      color:
        "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200",
    },
    {
      id: "5",
      label: "تجارب و خرابی",
      icon: <ToolOutlined />,
      content: <Experience />,
      color:
        "bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 border border-rose-200",
    },
    {
      id: "6",
      label: "خرید",
      icon: <ShoppingOutlined />,
      content: <ProductPurchase />,
      color:
        "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-200",
    },
    {
      id: "7",
      label: "درخواست کالا از انبار",
      icon: <InboxOutlined />,
      content: <RequestOfWarehouse />,
      color:
        "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200",
    },
    {
      id: "8",
      label: "صورت جلسات",
      icon: <TeamOutlined />,
      content: <Meetings />,
      color:
        "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-200",
    },
    {
      id: "9",
      label: "فعالیت ها",
      icon: <BarChartOutlined />,
      content: <Activity />,
      color:
        "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200",
    },
    {
      id: "10",
      label: "گزارش ها",
      icon: <AuditOutlined />,
      content: <Reports />,
      color:
        "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border border-cyan-200",
    },
    {
      id: "11",
      label: "توزیع نقش ها",
      icon: <SafetyCertificateOutlined />,
      content: <DetailAccessProduct />,
      color:
        "bg-gradient-to-r from-lime-100 to-lime-200 text-lime-800 border border-lime-200",
    },
  ];

  const updateIndicator = (tabId) => {
    const index = tabs.findIndex((tab) => tab.id === tabId);
    if (tabRefs.current[index] && tabsContainerRef.current) {
      const tabElement = tabRefs.current[index];
      const containerElement = tabsContainerRef.current;

      const tabRect = tabElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();

      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;

      setIndicatorStyle({
        left: `${left}px`,
        width: `${width}px`,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeTab);
    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  return (
    <div className="system-module w-full flex flex-col overflow-hidden font-sans">
      <div className="system-module__hero p-4 sm:p-5 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <div className="section-eyebrow">مرکز فرمان محصول</div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              مدیریت یکپارچه محصول
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              پنل نظارت و کنترل فرآیندهای سیستمی
            </p>
          </div>

          <button
            onClick={() => setShowAccessDetails(!showAccessDetails)}
            className={`access-profile group flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 w-full md:w-auto justify-between md:justify-start ${
              showAccessDetails
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            <div className="flex flex-col items-end leading-tight">
              <span className="text-xs font-light opacity-80">
                وضعیت دسترسی
              </span>
              <span className="text-sm font-bold">
                {accessList?.roles?.[0]?.name || "مشاهده پروفایل"}
              </span>
            </div>
            <div
              className={`p-2 rounded-full transition-colors duration-300 ${
                showAccessDetails
                  ? "bg-slate-700"
                  : "bg-slate-100 group-hover:bg-blue-50"
              }`}
            >
              {showAccessDetails ? <CaretUpOutlined /> : <FileAddFilled />}
            </div>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showAccessDetails
              ? "max-h-[500px] opacity-100 mt-4"
              : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <div className="access-card rounded-xl p-4 sm:p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 border-l border-slate-700 pl-4 flex flex-col justify-center">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserOutlined />
                  سمت های این محصول :
                </h3>
                <div className="flex flex-wrap gap-2">
                  {accessList?.roles?.map((role) => (
                    <span
                      key={role.id}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20"
                    >
                      {role.name}
                    </span>
                  ))}
                  {(!accessList?.roles || accessList.roles.length === 0) && (
                    <span className="text-slate-500 text-sm">
                      نقشی تعریف نشده
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-8">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UnlockOutlined /> لیست مجوزها
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {accessList?.permissions?.map((perm) => (
                    <div
                      key={perm.codename}
                      className="flex items-center gap-2 text-slate-300 text-xs bg-slate-700/50 p-2 rounded border border-slate-700 hover:border-slate-500 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                      <span className="truncate" title={perm.name}>
                        {perm.name}
                      </span>
                    </div>
                  ))}
                  {(!accessList?.permissions ||
                    accessList.permissions.length === 0) && (
                    <span className="text-slate-500 text-sm">
                      مجوزی یافت نشد
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="module-tabs relative"
        ref={tabsContainerRef}
      >
        <div className="flex overflow-x-auto scrollbar-hide gap-1.5 p-2">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => setActiveTab(tab.id)}
              className={`module-tab flex-shrink-0 flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "module-tab--active font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="ml-2">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        <div
          className="absolute bottom-0 h-0.5 bg-blue-400 transition-all duration-300"
          style={{
            ...indicatorStyle,
            transitionProperty: "left, width",
            transitionDuration: "300ms",
            transitionTimingFunction: "ease-out",
          }}
        />
      </div>

      <div className="module-content p-2 sm:p-4 min-h-[500px]">
        <div className="animate-fade-in-up">
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default GoodsCategories;
