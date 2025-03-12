import React, { useState } from "react";
import { Layout, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useMyAxios } from "../../utils/Api";
const { Header: AntHeader } = Layout;
import  ThemeToggle  from "../Theme/ThemeToggle";

const CustomHeader = ({ collapsed, setCollapsed }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { handleLogout } = useMyAxios();

  return (
    <AntHeader className="flex items-center justify-between px-4 mt-4 mx-6 bg-light-primary dark:bg-dark-primary border border-gray-400 shadow-xl drop-shadow-sm rounded-lg">
      <div className="flex items-center">
        {React.createElement(
          collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
          {
            className:
              "text-lg text-light-text-primary dark:text-dark-text-primary cursor-pointer",
            onClick: () => setCollapsed(!collapsed),
          }
        )}
      </div>

      <div className="flex items-center gap-4 ">
        {isLoggedIn ? (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Avatar
              className="cursor-pointer"
              icon={<UserOutlined />}
              src="https://example.com/avatar.png"
            />
          </Dropdown>
        ) : (
          <div className="flex items-center justify-between ml-4 gap-4">
            <LoginOutlined
              className="text-light-text-primary dark:text-dark-text-primary text-lg cursor-pointer"
              onClick={handleLogout}
            />
            <UserAddOutlined
              className="text-light-text-primary dark:text-dark-text-primary text-lg cursor-pointer"
              // onClick={() => navigate('/sign-up')}
            />
            {/* <ThemeToggle /> */}
          </div>
        )}
      </div>
    </AntHeader>
  );
};

export default CustomHeader;
