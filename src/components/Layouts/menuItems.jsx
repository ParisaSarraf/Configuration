import { HomeOutlined, DashboardOutlined, UserOutlined, SignatureOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

export const items = [
    {
        key: '1',
        icon: <HomeOutlined />,
        label: <Link to="/">خانه</Link>,
    },
    {
        key: '2',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">داشبورد</Link>,
    },
    {
        key: '3',
        icon: <SignatureOutlined />,
        label: <Link to="/signIn">ورود</Link>,
    },
    {
        key: '4',
        icon: <UserOutlined />,
        label: <Link to="/about">درباره ما</Link>,
    },
];