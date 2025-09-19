import {Button, Space, Tag} from "antd";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";
import {DeleteOutlined, FileExcelOutlined, PoweroffOutlined} from "@ant-design/icons";

const ListOfRequestsMadeCol = ({handleDelete, handleHide, handleExcelExportForRow}) => {
    return [
        {
            title: 'نام محصول',
            dataIndex: ['product', 'persian_title'],
            key: 'persian_title',

        },
        {
            title: 'کد محصول',
            key: 'code',
            dataIndex: ['product', 'code'],
            render: (record) => {
                return (<Tag color={'purple'}>{record}</Tag>)
            }
        },
        {
            title: 'نوع خرید',
            dataIndex: 'purchase_type',
            key: 'purchase_type',
            render: (record) => {
                return (<Tag
                    color={record === 'assembly' ? 'blue' : 'gold'}>{record === 'assembly' ? 'مونتاژ' : 'ساخت'}</Tag>)
            }
        },
        {
            title: 'تاریخ درخواست',
            dataIndex: 'date',
            key: 'date',
            render: (text) => {
                return (
                    <Tag color={'green'}>{georgianDateToJalaliDate(text)}</Tag>
                )
            }
        },
        {
            title: 'تاریخ تایید',
            dataIndex: 'total_number',
            key: 'total_number',
            render: (text) => {
                return (
                    <Tag color={'green'}>{georgianDateToJalaliDate(text) || 'ندارد'}</Tag>
                )
            }
        },
        {
            title: 'توضیح اکسل',
            dataIndex: 'export_description',
            key: 'export_description',
        },
        {
            title: 'عملیات',
            key: 'actions',
            render: (record) => {
                return (
                    <Space>
                        <Button
                            title={'خروجی اکسل'}
                            className={'text-green-500 border-green-500'}
                            onClick={() => handleExcelExportForRow(record)}
                            icon={<FileExcelOutlined/>}
                        />
                        <Button
                            title={'حذف'}
                            danger
                            onClick={() => handleDelete(record)}
                            icon={<DeleteOutlined/>}
                        />
                        <Button
                            title={'غیرفعال'}
                            className={'text-violet-500 border border-violet-500'}
                            onClick={() => handleHide(record)}
                            icon={<PoweroffOutlined/>}
                        />
                    </Space>
                )
            }
        },
    ]
}

export default ListOfRequestsMadeCol