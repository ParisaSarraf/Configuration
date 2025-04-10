import React, { useEffect, useState } from "react";
import { Dropdown, Image, Tooltip, Button } from "antd";
import {
  UserOutlined,
  LoginOutlined,
  SettingOutlined,
  ProfileOutlined,
  SecurityScanOutlined,
  DockerOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { BASEURL, useMyAxios } from "../../utils/Api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PersianDate from "persian-date";
import { AccessTimeOutlined } from "@mui/icons-material";


const CustomHeader = () => {
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
      setUserData({});
    }

    const interval = setInterval(() => {
      setCurrentTime(new PersianDate());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  <style jsx>{`
      .custom-tooltip .ant-tooltip-inner {
        background-color: white;
        color: black;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border-radius: 6px;
      }
      .custom-tooltip .ant-tooltip-arrow::before {
        background-color: white;
      }
    `}</style>

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
      key: 'documents',
      label: 'مدیریت اسناد',
      icon: <DockerOutlined />,
      onClick: () => {
        navigate("/panel/document/list");
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
    <header className="bg-Box rounded-lg my-2 mx-2 text-black ps-2 flex flex-row items-center justify-between h-12">
      <div className="flex flex-row gap-2 items-center">
        <p className="hidden md:block">سامانه جامع سیستم مدیریت پروژه (سما)</p>
      </div>
      <div className="flex flex-row items-center gap-4">
        <InboxOutlinedIcon />
        <Dropdown menu={{
          items: menuItems,
        }}
          trigger={['click']}>
          <SettingsOutlinedIcon />
        </Dropdown>
        <Tooltip
          title={
            <div className="flex flex-col gap-1 p-2">
              <div className="flex items-center gap-2 text-black">
                <AccessTimeOutlined fontSize="small" />
                <span>زمان جاری: {currentTime.format("HH:mm")}</span>
              </div>
              <div className="flex items-center gap-2 text-black">
                <CalendarOutlined fontSize="small" />
                <span>تاریخ: {currentTime.format("dddd D MMMM YYYY")}</span>
              </div>
              <div className="flex items-center gap-2 text-black">
                <LoginOutlined fontSize="small" />
                <span>آخرین ورود: {userData?.last_login || "-"}</span>
              </div>
            </div>
          }
          placement="bottomLeft"
          color="#ffffff"
          overlayClassName="custom-tooltip"
        >
          <Button type="text" className="flex items-center gap-2 bg-slate-300 ml-4" aria-label="User menu">
            {/* <Badge dot={!!userData} status="success" className="flex flex-row items-center gap-2"> */}
            {userData?.temp_image ? (
              <Image
                src={`${BASEURL.replace("/api/v1", "")}${userData.temp_image}`}
                width={24}
                height={24}
                style={{ borderRadius: '80%' }}
                preview={false}
                className="text-xl border-2 border-green-600"
                alt={`${userData.name}'s profile`}
                fallback={<AccountCircleOutlinedIcon className="text-xl" />}
              />
            ) : (
              <AccountCircleOutlinedIcon className="text-xl" />
            )}
            {/* </Badge> */}
            <span className="hidden sm:inline text-sm font-semibold">{userData?.name || 'کاربر'}</span>
          </Button>
        </Tooltip>

      </div>
    </header>
  );
};

export default CustomHeader