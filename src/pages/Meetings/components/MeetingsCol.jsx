import {Button, Flex, Tooltip} from "antd";
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