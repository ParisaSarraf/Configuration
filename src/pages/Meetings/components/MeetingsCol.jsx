import {Button, Flex, Tooltip, Tag} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

export const MeetingsCol = ({handleEdit, handleDelete}) => {
    return [
        {
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'موضوع جلسه',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'کد صورتجلسه',
            key: 'meetingCode',
            render: (_, record, index) => {
                const prefix = record.type === 'internal' ? 'MOU-I' : 'MOU-O';
                const productCode = record.product?.code;
                return `${prefix}-${productCode}-${index + 1}`;
            }
        },
        {
            title: 'نوع صورتجلسه',
            dataIndex: 'type',
            key: 'type',
            render: (record) => record.type === 'internal' ? 'داخلی' : 'خارجی',
        },
        {
            title: 'تاریخ جلسه',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'فایل ضمیمه',
            key: 'file',
            render: (record) => record.file ? (
                <a href={record.file} target="_blank" rel="noopener noreferrer">دانلود</a>
            ) : (
                'بدون فایل'
            ),
        },
        {
            title: 'عملیات',
            key: 'actions',
            render: (_, record) => (
                <Flex gap={4}>
                    <Tooltip title="حذف">
                        <Button
                            onClick={() => handleDelete(record.id)}
                            title="حذف"
                            icon={<DeleteOutlined/>}
                            danger
                        />
                    </Tooltip>
                    <Tooltip title="ویرایش">
                        <Button
                            icon={<EditOutlined/>}
                            className="text-green-500 border-green-500"
                            onClick={() => handleEdit(record)}
                            title='ویرایش'
                        />
                    </Tooltip>
                </Flex>
            ),
        },
    ];
};

export const MeetingRelatedToActivities = () => {
    return [
        {
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'نوع فعالیت',
            key: 'activityType',
            render: (record) => record.type || 'نامشخص',
        },
        {
            title: 'توضیحات',
            key: 'description',
            render: (record) => record.description || 'بدون توضیح',
        },
        {
            title: 'متولی',
            key: 'trustee',
            render: (record) => (
                <div>
                    {record.trustee?.name} {record.trustee?.last_name}
                    <br/>
                    {record.trustee_description && `(${record.trustee_description})`}
                </div>
            ),
        },
        {
            title: 'بازه زمانی',
            key: 'dateRange',
            render: (record) => (
                <div>
                    از: {record.from_date}
                    <br/>
                    تا: {record.to_date}
                </div>
            ),
        },
        {
            title: 'وضعیت',
            key: 'state',
            render: (record) => (
                <Tag color={record.state === 30 ? 'green' : 'orange'}>
                    {record.state === 30 ? 'تکمیل شده' : 'در حال انجام'}
                </Tag>
            ),
        },
        {
            title: 'تاریخ‌های مهم',
            key: 'importantDates',
            render: (record) => (
                <div>
                    <div>تاریخ انجام: {record.done_date}</div>
                    <div>تاریخ تایید: {record.confirmed_date}</div>
                </div>
            ),
        },
        {
            title: 'فایل‌ها',
            key: 'files',
            render: (record) => (
                <Flex vertical gap={4}>
                    {record.trustee_file && (
                        <a href={record.trustee_file} target="_blank" rel="noopener noreferrer">
                            دانلود فایل متولی
                        </a>
                    )}
                    {record.plan_file && (
                        <a href={record.plan_file} target="_blank" rel="noopener noreferrer">
                            دانلود فایل طرح
                        </a>
                    )}
                </Flex>
            ),
        },

    ];
};