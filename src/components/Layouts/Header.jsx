import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LoginOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; 

const { Header: AntHeader } = Layout;

const CustomHeader = ({ collapsed, setCollapsed }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate(); 

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate('/signIn');
    };

    const menuItems = [
        {
            key: '1',
            label: (
                <span onClick={handleLogout}>
                    خروج
                </span>
            ),
        },
    ];

    return (
        <AntHeader className="flex items-center justify-between px-4 shadow-sm bg-light-primary dark:bg-dark-primary">
            <div className="flex items-center">
                {React.createElement(
                    collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                    {
                        className: 'text-lg text-light-text-primary dark:text-dark-text-primary cursor-pointer',
                        onClick: () => setCollapsed(!collapsed),
                    }
                )}
            </div>

            <div className="flex items-center gap-4">
                {isLoggedIn ? (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Avatar
                            className="cursor-pointer"
                            icon={<UserOutlined />}
                            src="https://example.com/avatar.png"
                        />
                    </Dropdown>
                ) : (
                    <>
                        <LoginOutlined
                            className="text-light-text-primary dark:text-dark-text-primary text-lg cursor-pointer"
                            onClick={() => navigate('/signIn')}
                        />
                        <UserAddOutlined
                            className="text-light-text-primary dark:text-dark-text-primary text-lg cursor-pointer"
                            onClick={() => navigate('/signUp')}
                        />
                    </>
                )}
            </div>
        </AntHeader>
    );
};

export default CustomHeader;