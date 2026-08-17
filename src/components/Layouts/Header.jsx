import { useEffect, useState } from "react";
import { Avatar, Badge, Button, Divider, Dropdown, Tooltip } from "antd";
import {
  AppstoreOutlined,
  CalendarOutlined,
  FormOutlined,
  LoginOutlined,
  LogoutOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PersianDate from "persian-date";
import { useMyAxios } from "@/hooks/useMyAxios.js";
import { BASEURL } from "@/Services/axiosInstance.js";

const CustomHeader = ({ children }) => {
  const { handleLogout } = useMyAxios();
  const [currentTime, setCurrentTime] = useState(new PersianDate());
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        setUserData(decoded || {});
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }

    const intervalId = setInterval(
      () => setCurrentTime(new PersianDate()),
      60000,
    );
    return () => clearInterval(intervalId);
  }, []);

  const userFullName =
    userData?.name && userData?.last_name
      ? `${userData.name} ${userData.last_name}`
      : "کاربر مهمان";

  const menuItems = [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-3 px-1 py-2">
          <Avatar
            size={36}
            src={
              userData?.temp_image
                ? `${BASEURL.replace("/api/v1", "")}${userData.temp_image}`
                : null
            }
            icon={<UserOutlined />}
            className="border-2 border-slate-200 bg-slate-100 text-slate-500 shrink-0"
          />
          <div className="flex flex-col items-start min-w-0">
            <span className="font-semibold text-sm text-slate-800 truncate w-full">
              {userFullName}
            </span>
            <span className="text-xs text-slate-400">
              {userData?.is_staff ? "مدیر سیستم" : "کاربر"}
            </span>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "cartable",
      label: <span className="text-sky-700 font-medium">کارتابل شخصی</span>,
      icon: <UserOutlined className="text-sky-600" />,
      onClick: () => navigate("/my-work"),
      className:
        "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-sky-50",
    },
    {
      key: "change-password",
      label: (
        <span className="text-violet-700 font-medium">تغییر رمز عبور</span>
      ),
      icon: <SecurityScanOutlined className="text-violet-600" />,
      onClick: () => navigate("/forget-password"),
      className:
        "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-violet-50",
    },
    {
      key: "plan",
      label: (
        <span className="text-emerald-700 font-medium">برنامه ریزی تولید</span>
      ),
      icon: <SecurityScanOutlined className="text-emerald-600" />,
      onClick: () => navigate("/plan"),
      className:
        "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-emerald-50",
    },
    {
      key: "settings",
      label: <span className="text-slate-700 font-medium">تنظیمات</span>,
      icon: <SettingOutlined className="text-slate-500" />,
      className:
        "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-slate-50",
      children: [
        {
          key: "base-data",
          label: "داده‌های پایه",
          icon: <AppstoreOutlined />,
          onClick: () => navigate("/panel/datas"),
        },
        ...(userData?.is_staff
          ? [
              {
                key: "system-management",
                label: "مدیریت سیستم",
                icon: <SecurityScanOutlined />,
                onClick: () => navigate("/panel/system-management"),
              },
            ]
          : []),
      ],
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <span className="text-red-600 font-medium">خروج از حساب کاربری</span>
      ),
      icon: <LogoutOutlined className="text-red-500" />,
      onClick: handleLogout,
      className:
        "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-red-50",
    },
  ];

  const customDropdownFooter = (
    <div className="grid grid-cols-2 gap-2 p-2">
      <div className="flex flex-col items-start bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg transition-colors">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
          <CalendarOutlined />
          تاریخ امروز
        </span>
        <span className="text-xs font-semibold text-slate-600">
          {currentTime.format("D MMMM YYYY")}
        </span>
      </div>
      <div className="flex flex-col items-start bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg transition-colors">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
          <LoginOutlined />
          آخرین ورود
        </span>
        <span className="text-xs font-semibold text-slate-600">
          {userData?.last_login
            ? new PersianDate(userData.last_login).format("HH:mm")
            : "-"}
        </span>
      </div>
    </div>
  );

  const imageUrl = userData?.temp_image
    ? `${BASEURL.replace("/api/v1", "")}${userData.temp_image}`
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 rounded-xl my-2 mx-2 flex items-center justify-between h-14 shadow-sm ring-1 ring-slate-100 px-3 sm:px-4">
      {/* Left cluster: sidebar toggle + brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {children}
        <Divider type="vertical" className="hidden sm:block !h-6 !m-0" />
        <span className="hidden sm:block font-bold tracking-tight text-slate-800 truncate">
          مسیر
        </span>
      </div>

      {/* Right cluster: actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Tooltip title="فرم ساز" placement="bottom">
          <Button
            icon={<FormOutlined />}
            onClick={() => navigate("/forms")}
            className="!flex !items-center !gap-1.5 !border-sky-200 !bg-sky-50 !text-sky-700 hover:!bg-sky-100 hover:!border-sky-300 !font-medium !rounded-lg !shadow-none"
          >
            <span className="hidden md:inline">فرم ساز</span>
          </Button>
        </Tooltip>

        <Divider type="vertical" className="!h-6 !m-0" />

        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomLeft"
          arrow
          dropdownRender={(menu) => (
            <div className="bg-white rounded-xl shadow-xl mt-2 border border-slate-100 overflow-hidden min-w-[260px]">
              {menu}
              <Divider style={{ margin: 0 }} />
              {customDropdownFooter}
            </div>
          )}
        >
          <button
            className="flex items-center gap-2 cursor-pointer rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-50"
            aria-label="User menu"
          >
            <Badge
              dot
              status={userData?.is_staff ? "gold" : "success"}
              offset={[-4, 4]}
            >
              <Avatar
                src={imageUrl}
                icon={<UserOutlined />}
                className="border-2 border-slate-200 bg-slate-100 text-slate-500"
              />
            </Badge>
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 max-w-[140px] truncate">
              {userFullName}
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  );
};

export default CustomHeader;
