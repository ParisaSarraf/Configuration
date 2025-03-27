import React, { useState } from "react";
import { Layout, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LoginOutlined,
  SettingOutlined,
  ProfileOutlined,
  SecurityScanOutlined,
  BellOutlined,
  SettingFilled,
  SecurityScanFilled,
} from "@ant-design/icons";
import { Grid } from 'antd';
import { useMyAxios } from "../../utils/Api";
import ThemeToggle from "../Theme/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

const CustomHeader = () => {
  const isLoggedIn = localStorage.getItem("accessToken");
  const { handleLogout } = useMyAxios();
  const navigate = useNavigate();
  const decode = jwtDecode(localStorage.getItem("accessToken"));
  const screens = useBreakpoint();

  const menuItems = [
    {
      key: '1',
      icon: <ProfileOutlined />,
      label: `سلام ${decode.last_name}`,
    },
    {
      key: '2',
      label: 'تغییر رمزعبور',
      icon: <SecurityScanOutlined />,
      onClick: () => {
        navigate("/forget-password");
      },
    },
    {
      key: '3',
      label: 'داده بان',
      icon: <SettingOutlined />,
      onClick: () => {
        navigate("/panel/datas");
      },
    },
    {
      key: '4',
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
      key: '5',
      label: 'خروج',
      icon: <LoginOutlined />,
      onClick: () => {
        handleLogout();
      },
    },
  ];

  return (
    <AntHeader className="flex items-center justify-end px-4 bg-[#FFFFFF] dark:bg-dark-primary">
      <div className="flex items-center gap-4">
        {isLoggedIn && (
          <>
            {screens.md && (
              <BellOutlined className="text-xl p-1.5 bg-[#B5B6B7] text-white rounded-full" />
            )}

            <Dropdown
              menu={{
                items: menuItems,
              }}
              trigger={["hover"]}
            >
              <Avatar
                className="cursor-pointer"
                icon={<UserOutlined />}
                src={decode.signature_image ? decode.signature_image : "/user.png"}
              />
            </Dropdown>
          </>
        )}
        {/* <ThemeToggle /> */}
      </div>
    </AntHeader>
  );
};

export default CustomHeader;