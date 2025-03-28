import React, { useEffect, useState } from "react";
import { Layout, Avatar, Dropdown, Image } from "antd";
import Icon, {
  UserOutlined,
  LoginOutlined,
  SettingOutlined,
  ProfileOutlined,
  SecurityScanOutlined,
  BellOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Grid } from 'antd';
import { useMyAxios } from "../../utils/Api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PersianDate from "persian-date";

const { Header } = Layout;
const { useBreakpoint } = Grid;
const baseUrl = "http://87.248.150.51:8000"


const CustomHeader = () => {
  const isLoggedIn = localStorage.getItem("accessToken");
  const { handleLogout } = useMyAxios();
  const [currentTime, setCurrentTime] = useState(new PersianDate());
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const screens = useBreakpoint();

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        setUserData(decoded || {});
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setUserData({});
    }

    const interval = setInterval(() => {
      setCurrentTime(new PersianDate());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: `سلام ${userData?.last_name || "کاربر"}`,
    },
    {
      key: 'last-login',
      label: `آخرین ورود: ${userData?.last_login ? new PersianDate(userData.last_login).format(' HH:mm MM/DD') : "-"}`,
      icon: <UserOutlined />,
    },
    {
      key: 'change-password',
      label: 'تغییر رمزعبور',
      icon: <SecurityScanOutlined />,
      onClick: () => {
        navigate("/forget-password");
      },
    },
    {
      key: 'datas',
      label: 'داده بان',
      icon: <SettingOutlined />,
      onClick: () => {
        navigate("/panel/datas");
      },
    },
    {
      key: 'system-managment',
      label: 'مدیریت سیستم',
      icon: <SecurityScanOutlined />,
      onClick: () => {
        navigate("/panel/system-managment");
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'خروج',
      danger: true,
      icon: <LoginOutlined rotate={90} />,
      onClick: () => {
        handleLogout();
      },
    }]

  return (
    <Header className="flex items-center justify-between px-4 bg-white dark:bg-dark-primary shadow-sm">
      <div className="hidden md:flex items-center gap-2">
        <time dateTime={currentTime.format()} className="font-medium">
          {currentTime.format("HH:mm")}
        </time>
        <span>
          {currentTime.format("dddd D MMMM YYYY")}
        </span>
      </div>

      <div className="flex flex-row gap-2">
        <span className="text-sky-800">سامانه سما (سیستم مدیریت اسناد )</span>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn && (
          <>
            {screens.md && (
              <BellOutlined className="text-xl p-1.5 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors" />
            )}

            <Dropdown
              menu={{
                items: menuItems,
              }}
              trigger={["click"]}
              overlayClassName="dark:bg-dark-secondary"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="hidden sm:inline text-sm">
                  {userData?.name || 'کاربر'}
                </span>

                {userData?.temp_image ? (
                  <Image
                    src={`${baseUrl}${userData.temp_image}`}
                    width={33}
                    height={33}
                    style={{ borderRadius: '50%' }}
                    preview={false}
                    className="text-xl border-2 border-green-600"
                    alt={`${userData.name}'s profile`}
                    fallback={<UserOutlined className="text-xl" />}
                  />
                ) : (
                  <UserOutlined className="text-xl" />
                )}
              </div>
            </Dropdown>
          </>
        )}
        {/* <ThemeToggle /> */}
      </div>
    </Header>
  );
};

export default CustomHeader;