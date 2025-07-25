import { Button, Flex, Tooltip, Tag, Divider } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, FolderAddOutlined, UserAddOutlined } from "@ant-design/icons";

export const ActivityCols = ({ handleEdit, handleDelete, handleTrustee, handlePlan, handleDetail }) => {
    return ([
        {
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: "کد فعالیت",
            dataIndex: 'meeting',
            key: 'meeting',
            render(text, record) {
                return (
                    <Tag color="blue">{record.meeting?.code || 'بدون کد'}</Tag>
                )
            }
        },
        {
            title: "شرح فعالیت",
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: "متولی",
            dataIndex: ['trustee', 'name'],
            key: 'trustee',
            render: (name, record) => `${name} ${record.trustee?.last_name || ''}`
        },
        // {
        //     title: "تاریخ شروع",
        //     dataIndex: 'from_date',
        //     key: 'from_date'
        // }
        , {
            title: "تاریخ پایان",
            dataIndex: 'to_date',
            key: 'to_date'
        }, {
            title: "تایید انجام",
            dataIndex: 'confirmed_date',
            key: 'confirmed_date'
        }, {
            title: "نفر روز",
            dataIndex: 'person_day',
            key: 'person_day'
        }, {
            title: "درصد عملکرد",
            dataIndex: 'description',
            key: 'description'
        }, {
            title: "عملیات",
            key: 'actions',
            render: (_, record) => (
                <Flex gap={4}>
                    <Tooltip title="حذف">
                        <Button
                            onClick={() => handleDelete(record.id)}
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="ویرایش">
                        <Button
                            icon={<EditOutlined />}
                            className="text-green-500 border-green-500"
                            onClick={() => handleEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    {/* <Divider /> */}
                    <Tooltip title="انجام توسط متولی">
                        <Button
                            icon={<UserAddOutlined />}
                            className="text-orange-600 border-orange-600"
                            onClick={() => handleTrustee(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="انجام توسط طرح و برنامه">
                        <Button
                            icon={<FolderAddOutlined />}
                            className="text-pink-700 border-pink-700"
                            onClick={() => handlePlan(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="جزئیات">
                        <Button
                            icon={<EyeOutlined />}
                            className="text-sky-500 border-sky-500"
                            onClick={() => handleDetail(record)}
                            title='نمایش جزئیات '
                            size="small"
                        />
                    </Tooltip>
                </Flex>
            ),
        }]
    )
};

export const ActivityDetail = [
    // {
    //     title: "متولی",
    //     dataIndex: ['trustee', 'name'],
    //     key: 'trustee',
    //     render: (name, record) => `${name} ${record.trustee?.last_name || ''}`
    // },
    {
        title: 'توضیحات متولی',
        dataIndex: 'trustee_description',
        key: 'trustee_description',
        render: (text) => text || 'بدون توضیح'
    },
    {
        title: "تاریخ تایید طرح و برنامه",
        dataIndex: 'confirmed_date',
        key: 'confirmed_date'
    },
    {
        title: 'فایل متولی',
        dataIndex: 'trustee_file',
        key: 'trustee_file',
        render: (file) => file ? (
            <a href={file} target="_blank" rel="noopener noreferrer">دانلود</a>
        ) : 'بدون فایل'
    },
    {
        title: 'فایل طرج و برنامه',
        dataIndex: 'plan_file',
        key: 'plan_file',
        render: (file) => file ? (
            <a href={file} target="_blank" rel="noopener noreferrer">دانلود</a>
        ) : 'بدون فایل'
    }
];