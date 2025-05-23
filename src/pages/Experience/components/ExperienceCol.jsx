import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Space, Tooltip } from "antd"

const ExperienceCol = () => {
    return [
        {
            title: 'حوزه',
            dataIndex: 'domain',
            key: 'domain'
        },
        {
            title: 'متن تجربه',
            dataIndex: 'experienceText',
            key: 'experienceText'
        },
        {
            title: 'کاربر ثبت کننده',
            dataIndex: 'createdBy',
            key: 'createdBy'
        },
        {
            title: 'تاریخ ثبت',
            dataIndex: 'createdAt',
            key: 'createdAt'
        },
        {
            title: 'کد پروژه',
            dataIndex: 'projectCode',
            key: 'projectCode'
        },
        {
            title: 'فایل پیوست',
            dataIndex: 'attachment',
            key: 'attachment',
            render: (file) => file ? <a href={file.url} target="_blank" rel="noreferrer">{file.name}</a> : 'ندارد'
        },
        {
            title: 'عملیات',
            // dataIndex: 'projectCode',
            // key: 'projectCode'
            render() {
                return (
                    <Space>
                        <Tooltip title="ویرایش">
                            <Button title="ویرایش" icon={<EditOutlined />} className="text-green-500 , border-green-500" />
                        </Tooltip>
                        <Tooltip title="حذف">
                            <Button title="حذف" icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Space>
                )
            }
        }
    ]
}

export default ExperienceCol