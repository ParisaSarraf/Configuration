import {useEffect, useState} from "react";
import {Avatar, Divider, Dropdown} from "antd";
import {
    AppstoreOutlined,
    CalendarOutlined,
    LoginOutlined,
    LogoutOutlined,
    SecurityScanOutlined,
    SettingOutlined,
    UserOutlined
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import PersianDate from "persian-date";
import {useMyAxios} from "@/hooks/useMyAxios.js";
import {BASEURL} from "@/Services/axiosInstance.js";

const CustomHeader = ({children}) => {
    const {handleLogout} = useMyAxios();
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

        const intervalId = setInterval(() => setCurrentTime(new PersianDate()), 60000);
        return () => clearInterval(intervalId);
    }, []);

    const userFullName = userData?.name && userData?.last_name ? `${userData.name} ${userData.last_name}` : 'کاربر مهمان';

    const menuItems = [
        {
            key: 'profile',
            label: (
                <div className="flex flex-col items-start px-2 pt-2">
                    <span className="font-semibold text-base text-slate-800">{userFullName}</span>
                    <span className="text-xs text-slate-500">{userData?.is_staff ? 'مدیر سیستم' : 'کاربر'}</span>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'cartable',
            label: <span className={'text-sky-600'}>کارتابل شخصی</span>,
            icon: <UserOutlined className={'text-sky-700'}/>,
            onClick: () => navigate("/my-work"),
            className: '!rounded-md !my-1 !p-2 transition-colors bg-sky-100 text-sky-700 hover:!bg-sky-100'
        },
        {
            key: 'change-password',
            label: <span className={'text-violet-600'}>تغییر رمز عبور</span>,
            icon: <SecurityScanOutlined className={'text-violet-700'}/>,
            onClick: () => navigate("/forget-password"),
            className: '!rounded-md !my-1 !p-2 transition-colors bg-violet-50 text-violet-700 hover:!bg-violet-100'
        },
        {
            key: 'settings',
            label: 'تنظیمات',
            icon: <SettingOutlined/>,
            className: '!rounded-md !my-1 !p-2 transition-colors bg-slate-50 text-slate-700 hover:!bg-slate-100',
            children: [
                {
                    key: 'base-data',
                    label: 'داده‌های پایه',
                    icon: <AppstoreOutlined/>,
                    onClick: () => navigate("/panel/datas"),
                },
                ...(userData?.is_staff ? [{
                    key: 'system-management',
                    label: 'مدیریت سیستم',
                    icon: <SecurityScanOutlined/>,
                    onClick: () => navigate("/panel/system-management"),
                }] : []),
            ]
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: <span className={'text-red-500'}> خروج از حساب کاربری</span>,
            icon: <LogoutOutlined className={'text-red-500'}/>,
            onClick: handleLogout,
            className: '!rounded-md !my-1 !p-2 transition-colors bg-red-50 text-red-700 hover:!bg-red-100'
        },
    ];

    const customDropdownFooter = (
        <div className="grid grid-cols-2 gap-2 p-2">
            <div className="flex flex-col items-start bg-slate-50 hover:bg-slate-100 p-2 rounded-md transition-colors">
                 <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                     <CalendarOutlined/>
                     تاریخ امروز
                 </span>
                <span className="text-xs font-semibold text-slate-600">
                    {currentTime.format("D MMMM YYYY")}
                </span>
            </div>
            <div className="flex flex-col items-start bg-slate-50 hover:bg-slate-100 p-2 rounded-md transition-colors">
                <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <LoginOutlined/>
                    آخرین ورود
                </span>
                <span className="text-xs font-semibold text-slate-600">
                    {userData?.last_login ? new PersianDate(userData.last_login).format('HH:mm') : "-"}
                </span>
            </div>
        </div>
    );

    const imageUrl = userData?.temp_image ? `${BASEURL.replace("/api/v1", "")}${userData.temp_image}` : null;

    return (
        <header
            className="bg-white rounded-lg my-2 mx-2 flex items-center justify-between h-14 shadow-sm border border-gray-100 px-4">
            <div className="flex items-center gap-3">
                {children}
                <span className="hidden md:block font-semibold text-slate-700">
                    مسیر
                </span>
            </div>

            <div className="flex items-center gap-4">
                <Dropdown
                    menu={{items: menuItems}}
                    trigger={['click']}
                    placement="bottomLeft"
                    arrow
                    dropdownRender={(menu) => (
                        <div className="bg-white rounded-lg shadow-2xl mt-2  border border-slate-50">
                            {menu}
                            <Divider style={{margin: '0'}}/>
                            {customDropdownFooter}
                        </div>
                    )}
                >
                    <button className="flex items-center gap-2 cursor-pointer" aria-label="User menu">
                        <Avatar
                            src={imageUrl}
                            icon={<UserOutlined/>}
                            className="border-2 border-slate-200 bg-slate-100 text-slate-500"
                        />
                        <span className="hidden sm:inline text-sm font-semibold text-gray-700">
                            {userFullName}
                        </span>
                    </button>
                </Dropdown>
            </div>
        </header>
    );
};

export default CustomHeader;