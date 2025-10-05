import {useEffect, useState} from "react";
import {Avatar, Divider} from "antd";
import {
    AppstoreOutlined,
    CalendarOutlined,
    LoginOutlined,
    LogoutOutlined,
    SecurityScanOutlined,
    SettingOutlined,
    UserOutlined
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode";
import PersianDate from "persian-date";
import {useMyAxios} from "@/hooks/useMyAxios.js";
import {BASEURL} from "@/Services/axiosInstance.js";

const calculateRadialPosition = (index, totalItems, distance) => {
    const startAngle = 130;
    const endAngle = 180;

    const angle = startAngle + (index / (totalItems - 1)) * (endAngle - startAngle);

    const radians = angle * (Math.PI / 90);

    const x = distance * Math.cos(radians);
    const y = distance * Math.sin(radians);

    return {
        left: `${x}px`,
        top: `${-y}px`,
    };
};

const CustomHeader = () => {
    const {handleLogout} = useMyAxios();
    const [currentTime, setCurrentTime] = useState(new PersianDate());
    const [userData, setUserData] = useState({});
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const primaryTextColor = 'text-dark-text-primary';
    const secondaryTextColor = 'text-dark-text-secondary';
    const neonColor = 'text-Neon-Primary';
    const RADIAL_DISTANCE = 100;

    const allActions = [
        {
            key: 'cartable',
            icon: <UserOutlined/>,
            onClick: () => navigate("/my-work"),
            tooltip: 'کارتابل شخصی',
            color: 'text-rose-400'
        },
        {
            key: 'change-password',
            icon: <SecurityScanOutlined/>,
            onClick: () => navigate("/forget-password"),
            tooltip: 'تغییر رمز عبور',
            color: 'text-sky-400'
        },
        {
            key: 'base-data',
            icon: <AppstoreOutlined/>,
            onClick: () => navigate("/panel/datas"),
            tooltip: 'داده‌های پایه',
            color: 'text-violet-400'
        },
        ...(userData?.is_staff ? [{
            key: 'system-management',
            icon: <SettingOutlined/>,
            onClick: () => navigate("/panel/system-management"),
            tooltip: 'مدیریت سیستم',
            color: 'text-emerald-400'
        }] : []),
        {
            key: 'logout',
            icon: <LogoutOutlined/>,
            onClick: handleLogout,
            color: 'text-red-500',
            tooltip: 'خروج از حساب'
        },
    ];

    const imageUrl = userData?.temp_image ? `${BASEURL.replace("/api/v1", "")}${userData.temp_image}` : null;

    return (
        <div className="fixed top-4 left-4 z-50">
            <div className="relative">
                {allActions.map((item, index) => {
                    const totalItems = allActions.length;
                    const {left, top} = calculateRadialPosition(index, totalItems, RADIAL_DISTANCE);

                    return (
                        <div
                            key={item.key}
                            className={`
                                absolute transition-all duration-300 
                                ${isMenuOpen ? 'opacity-100 scale-100 z-40' : 'opacity-0 scale-0 z-30 pointer-events-none'}
                            `}
                            style={{
                                left: isMenuOpen ? left : '0px',
                                top: isMenuOpen ? top : '0px',
                                transitionDelay: `${index * 0.05}s`
                            }}
                        >
                            <button
                                onClick={item.onClick}
                                className={`
                                    w-10 h-10 rounded-full AeroBox flex items-center justify-center text-xl 
                                    ${item.color || neonColor} 
                                    hover:bg-Neon-Primary/30 hover:shadow-lg transition-colors
                                `}
                                aria-label={item.tooltip}
                                title={item.tooltip}
                            >
                                {item.icon}
                            </button>
                        </div>
                    );
                })}

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center justify-center cursor-pointer p-0 w-14 h-14 rounded-full AeroBox border-Neon-Primary/70 hover:scale-105 transition-transform duration-300 relative z-50"
                    aria-label="User menu"
                >
                    <Avatar
                        src={imageUrl}
                        icon={<UserOutlined/>}
                        className={`bg-dark-secondary/30 text-Neon-Primary`}
                        size="large"
                    />
                </button>
            </div>

            {isMenuOpen && (
                <div
                    className="absolute top-2 left-44 p-3 AeroBox min-w-max rounded-xl z-50 pointer-events-none"
                    style={{
                        transformOrigin: 'top right',
                        transition: 'opacity 0.3s',
                    }}
                >
                    <div className="p-1 pointer-events-auto">
                        <div className="flex flex-col items-start pb-2">
                            <span className={`font-bold ${primaryTextColor}`}>{userFullName}</span>
                            <span
                                className={`text-xs ${secondaryTextColor}`}>{userData?.is_staff ? 'مدیر سیستم' : 'کاربر'}</span>
                        </div>

                        <Divider style={{margin: '4px 0', backgroundColor: 'rgba(195, 123, 245, 0.15)'}}/>

                        <div className="flex flex-col items-start space-y-1 pt-1">
                            <span className={`text-xs ${secondaryTextColor} flex items-center gap-1`}>
                                <CalendarOutlined
                                    className={neonColor}/> تاریخ امروز: {currentTime.format("D MMMM YYYY")}
                            </span>
                            <span className={`text-xs ${secondaryTextColor} flex items-center gap-1`}>
                                <LoginOutlined
                                    className={neonColor}/> آخرین ورود: {userData?.last_login ? new PersianDate(userData.last_login).format('HH:mm') : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomHeader;