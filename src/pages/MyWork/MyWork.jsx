import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
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
import { useGetActivityUserPerformance } from "../../QueryServises/PanelQuery";

const MyWork = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const { data: performanceData } = useGetActivityUserPerformance();

  useEffect(() => {
    const getUsernameFromToken = () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          console.warn("No access token found");
          setUserName("کاربر");
          return;
        }

        const decodedToken = jwtDecode(accessToken);
        const name =
          decodedToken?.name ||
          decodedToken?.username ||
          decodedToken?.fullName ||
          decodedToken?.sub ||
          "کاربر";

        setUserName(name);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserName("کاربر");
      }
    };

    getUsernameFromToken();
  }, []);

  const items = [
    {
      label: "فعالیت های باقیمانده",
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
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                کارتابل <span className="text-sky-600">{userName}</span>
              </h1>
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-5 py-3 shadow-sm border border-blue-100">
                <span className="text-lg font-semibold text-slate-700">
                  درصد عملکرد:
                </span>
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {performanceData?.[0]?.avg_performance}٪
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 p-1 flex items-center gap-1 rounded-xl border border-slate-200">
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveKey(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeKey === item.key ? item.activeClass : item.inactiveClass
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div>{activeComponent}</div>
        </main>
      </div>
    </div>
  );
};

export default MyWork;
