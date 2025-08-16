import {Tag} from "antd";


export const AccessProductCol = () => {
    return [
        {
            title: 'نام کاربر',
            dataIndex: ['user', 'name'],
            key: 'user_name',
            render: (name, record) => `${name} ${record.user?.last_name || ''}`
        },
        {
            title: 'نام کاربری',
            dataIndex: ['user', 'username'],
            key: 'username'
        },
        {
            title: 'نقش',
            dataIndex: ['role', 'name'],
            key: 'role_name'
        },
        {
            title: 'صفحه‌های قابل دسترسی',
            dataIndex: ['user', 'accessible_pages'],
            key: 'accessible_pages',
            render: (pages) => {
                return (
                    <Tag color={'purple'}>{pages}</Tag>
                )
            }
        },
        {
            title: 'تاریخ ثبت',
            dataIndex: ['user', 'registry_date'],
            key: 'registry_date',
            render: (date) => date ? new Date(date).toLocaleDateString('fa-IR') : '---'
        },
        {
            title: 'وضعیت',
            dataIndex: ['user', 'is_superuser'],
            key: 'status',
            render: (isSuperuser) => isSuperuser ? 'مدیر سیستم' : 'کاربر عادی'
        }
    ];
};