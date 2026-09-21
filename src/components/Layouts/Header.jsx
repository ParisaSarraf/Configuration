import { useEffect, useState } from "react";
import { Avatar, Badge, Divider, Dropdown, Tooltip } from "antd";
import {
 AppstoreOutlined,
 CalendarOutlined,
 FormOutlined,
 LoginOutlined,
 LogoutOutlined,
 PartitionOutlined,
 SecurityScanOutlined,
 SettingOutlined,
 UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PersianDate from "persian-date";
import { useMyAxios } from "@/hooks/useMyAxios.js";
import { BASEURL } from "@/Services/axiosInstance.js";
import { useAccessList } from "@/QueryServises/accsessQuery";
import { resolveBuilderAccess } from "@/Services/access/builderAccess";

const CustomHeader = ({ children }) => {
 const { handleLogout } = useMyAxios();
 const [currentTime, setCurrentTime] = useState(new PersianDate());
 const [userData, setUserData] = useState({});
 const navigate = useNavigate();
 const accessQuery = useAccessList({
 staleTime: 5 * 60 * 1000,
 refetchOnWindowFocus: false,
 refetchOnReconnect: false,
 retry: false,
 });
 const builderAccess = resolveBuilderAccess(userData, accessQuery.data);

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
 label: <span className="text-blue-700 font-medium">کارتابل شخصی</span>,
 icon: <UserOutlined className="text-blue-600" />,
 onClick: () => navigate("/my-work"),
 className:
 "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-blue-50",
 },
 {
 key: "cartable-process-maker",
 label: (
 <span className="text-amber-700 font-medium">کارتابل فرآیندساز</span>
 ),
 icon: <FormOutlined className="text-amber-600" />,
 onClick: () => navigate("/cartable-process-maker"),
 className:
 "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-amber-50",
 },
 {
 key: "change-password",
 label: (
 <span className="text-blue-700 font-medium">تغییر رمز عبور</span>
 ),
 icon: <SecurityScanOutlined className="text-blue-600" />,
 onClick: () => navigate("/forget-password"),
 className:
 "!rounded-lg !my-0.5 !py-2.5 !px-3 transition-colors hover:!bg-blue-50",
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
 <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
 <CalendarOutlined />
 تاریخ امروز
 </span>
 <span className="text-xs font-semibold text-slate-600">
 {currentTime.format("D MMMM YYYY")}
 </span>
 </div>
 <div className="flex flex-col items-start bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg transition-colors">
 <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
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
 <header className="app-header sticky top-0 z-40 m-2 flex items-center justify-between min-h-14 px-2 sm:px-3">
 {/* Left cluster: sidebar toggle + brand */}
 <div className="flex items-center gap-2 sm:gap-3 min-w-0">
 {children}
 <Divider type="vertical" className="hidden sm:block !h-7 !m-0" />
 <div className="hidden sm:flex items-center gap-2.5 min-w-0">
 <span className="brand-mark"><PartitionOutlined /></span>
 <div className="min-w-0 leading-tight">
 <strong className="block text-sm text-slate-800 truncate">مسیر</strong>
 <span className="block text-xs text-slate-400 truncate">سامانه مدیریت یکپارچه</span>
 </div>
 </div>
 </div>

 {/* Right cluster: actions */}
 <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
 {builderAccess.formBuilder || builderAccess.processBuilder ? (
 <>
 <div className="flex items-center rounded-lg ring-1 ring-slate-200 bg-slate-50/60 overflow-hidden">
 {builderAccess.formBuilder ? (
 <Tooltip title="فرم ساز" placement="bottom">
 <button
 onClick={() => navigate("/forms")}
 className="flex items-center gap-1.5 px-3 h-8 text-sm font-medium text-slate-600 hover:bg-white hover:text-blue-600 transition-colors"
 >
 <FormOutlined />
 <span className="hidden md:inline">فرم ساز</span>
 </button>
 </Tooltip>
 ) : null}
 {builderAccess.formBuilder && builderAccess.processBuilder ? (
 <div className="w-px h-5 bg-slate-200" />
 ) : null}
 {builderAccess.processBuilder ? (
 <Tooltip title="فرایندساز" placement="bottom">
 <button
 onClick={() => navigate("/processes")}
 className="flex items-center gap-1.5 px-3 h-8 text-sm font-medium text-slate-600 hover:bg-white hover:text-emerald-600 transition-colors"
 >
 <PartitionOutlined />
 <span className="hidden md:inline">فرایندساز</span>
 </button>
 </Tooltip>
 ) : null}
 </div>
 <Divider type="vertical" className="!h-6 !m-0" />
 </>
 ) : null}

 <Dropdown
 menu={{ items: menuItems }}
 trigger={["click"]}
 placement="bottomLeft"
 arrow
 dropdownRender={(menu) => (
 <div className="bg-white rounded-xl shadow-xl mt-2 border border-slate-100 overflow-hidden w-[min(280px,calc(100vw-24px))]">
 {menu}
 <Divider style={{ margin: 0 }} />
 {customDropdownFooter}
 </div>
 )}
 >
 <button
 className="app-icon-button flex items-center gap-2 cursor-pointer rounded-lg px-1.5 transition-colors hover:bg-slate-50"
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
