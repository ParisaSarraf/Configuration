import {DeleteOutlined, EditOutlined} from "@ant-design/icons"
import {Button, Space, Tag, Tooltip} from "antd"
import {georgianDateToJalaliDate} from "@utils/timeTool.js";

const RequestWareHouseCol = ({handleEdit, handleDelete}) => {
    return [
        {
            title: 'نوع خرید',
            dataIndex: 'request_type',
            key: 'request_type',
            render: (record) => {
                return (
                    <Tag color={record === 'assembly' ?'cyan' : 'gold'}>
                        {record === 'assembly' ? 'مونتاژ' : 'ساخت'}
                    </Tag>                )
            }
        },
        {
            title: 'تعداد',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => text || 'ندارد'
        },
        // {
        //     title: 'درصد مونتاژ',
        //     dataIndex: 'charge_percentage',
        //     key: 'charge_percentage',
        //     render: (text) => text || 'ندارد'
        // },
        {
            title: 'تعداد پشتیبانی',
            dataIndex: 'support_number',
            key: 'support_number',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تعداد کل',
            dataIndex: 'total_number',
            key: 'total_number',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تاریخ درخواست',
            dataIndex: 'date',
            key: 'date',
            render: (text) => {
                return (
                    <span>{georgianDateToJalaliDate(text)}</span>
                )
            }
        },
        {
            title: 'عملیات',
            render(_, record) {
                return (
                    <Space>
                        <Tooltip title="ویرایش">
                            <Button title="ویرایش" icon={<EditOutlined/>} className="text-green-500 , border-green-500"
                                    onClick={() => handleEdit(record)}
                                    size="small"/>
                        </Tooltip>
                        <Tooltip title="حذف">
                            <Button title="حذف" icon={<DeleteOutlined/>} danger
                                    onClick={() => handleDelete(record?.id)} size="small"/>
                        </Tooltip>
                    </Space>
                )
            }
        }
    ]
}

export default RequestWareHouseCol
