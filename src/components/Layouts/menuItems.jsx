import { ProductOutlined, UserSwitchOutlined, TeamOutlined, ProjectOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Users from '../../pages/Users/Users';

export const items = [
    {
        key: '1',
        icon: <UserSwitchOutlined />,
        label: <Link to="/panel/system-managment">مدیریت سیستم</Link>
        
    },
    {
        key: '2',
        icon: <ProductOutlined />,
        label: 'پروژه‌ها',
        children: [
            {
                key: '2-1',
                icon: <ProjectOutlined />,
                label: <Link to="/panel/projects/list">لیست پروژه‌ها</Link>,
            },
            {
                key: '2-2',
                icon: <ProductOutlined />,
                label: <Link to="/panel/projects/categories">دسته‌بندی‌ها</Link>,
            },
        ],
    },
];