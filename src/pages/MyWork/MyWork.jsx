import { useState } from "react";
import Header from "@/components/Layouts/Header.jsx";
import MyActivities from "@/pages/MyWork/MyActivities/MyActivities.jsx";
import MyDocuments from "@/pages/MyWork/MyDocuments/MyDocuments.jsx";
import MyPlan from "@/pages/MyWork/MyPlan/MyPlan.jsx";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import Waiting from "@/pages/MyWork/Waiting/Waiting.jsx";

const MyWork = () => {
  const navigate = useNavigate();
  const items = [
    {
      label: "فعالیت های من",
      key: "1",
      icon: <HistoryOutlined />,
      children: <MyActivities />,
      activeClass: "bg-sky-200 text-sky-800 shadow-md",
      inactiveClass: "text-sky-700 hover:bg-sky-100",
    },
    {
      label: "فعالیت های در انتطار تایید",
      key: "2",
      icon: <ClockCircleOutlined />,
      children: <Waiting />,
      activeClass: "bg-pink-200 text-pink-800 shadow-md",
      inactiveClass: "text-pink-700 hover:bg-pink-100",
    },
    {
      label: "کارهای من",
      key: "3",
      icon: <CheckCircleOutlined />,
      children: <MyPlan />,
      activeClass: "bg-violet-200 text-violet-800 shadow-md",
      inactiveClass: "text-violet-700 hover:bg-violet-100",
    },
    {
      label: "اسناد باقیمانده من",
      key: "4",
      icon: <FileDoneOutlined />,
      children: <MyDocuments />,
      activeClass: "bg-emerald-200 text-emerald-800 shadow-md",
      inactiveClass: "text-emerald-700 hover:bg-emerald-100",
    },
  ];

  const [activeKey, setActiveKey] = useState(items[0].key);
  const activeComponent = items.find(
    (item) => item.key === activeKey
  )?.children;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/")}
              className="flex items-center text-slate-600 hover:!text-sky-700 mb-4"
            >
              بازگشت به صفحه اصلی
            </Button>
            <div className="w-full flex flex-row justify-between items-center">
              <h1 className="text-3xl font-bold text-slate-900">
                کارتابل شخصی
              </h1>
              <p className="text-xl font-medium text-slate-800">
                {`درصد عملکرد : `}
                <span className="font-bold text-blue-600">۸۵٪</span>
              </p>
            </div>
            <p className="mt-2 text-base text-slate-600">
              فعالیت‌ها، اسناد و کارهای خود را در اینجا مدیریت کنید.
            </p>
          </div>

          <div className="bg-slate-100 p-1 flex items-center gap-1 rounded-xl border border-slate-200">
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveKey(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeKey === item.key ? item.activeClass : item.inactiveClass
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="bg-white rounded-xl shadow-lg border border-slate-200 min-h-[60vh] p-6">
          <div >{activeComponent}</div>
        </main>
      </div>
    </div>
  );
};

export default MyWork;
