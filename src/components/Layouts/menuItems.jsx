import { ProductOutlined, UserSwitchOutlined, TeamOutlined, ProjectOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

export const items = [
    {
        key: '1',
        icon: <UserSwitchOutlined />,
        label: 'کاربران',
        children: [
            {
                key: '1-1',
                icon: <TeamOutlined />,
                label: <Link to="/panel/users/list">لیست کاربران</Link>,
            },
            {
                key: '1-2',
                icon: <UserSwitchOutlined />,
                label: <Link to="/panel/users/roles">نقش‌های کاربری</Link>,
            },
        ],
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