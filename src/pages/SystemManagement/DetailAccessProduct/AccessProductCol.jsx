import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";
import {Tag} from 'antd'

export const AccessProductCol = () => [
    {
        title: 'نام کاربر',
        key: 'user_name',
        render: (_, record) => {
            return (
                <Tag color={'orange'}>{record.user?.name || ''} {record.user?.last_name || ''}</Tag>
            )
        },
    },
    {
        title: 'نقش',
        key: 'role_name',
        render: (_, record) => {
            return (
                <Tag color={'blue'}>{record.role?.name || 'ندارد'}</Tag>
            )
        },
    },
    {
        title: 'تاریخ ثبت',
        key: 'registry_date',
        render: (_, record) => {
            return (
                <Tag color={'cyan'}>{georgianDateToJalaliDate(record?.user?.registry_date)}</Tag>
            )
        },
    },
];
