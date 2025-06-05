import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Image, Space, Tooltip } from "antd"
import { BASEURL } from "../../../Services/axiosInstance"

const ExperienceCol = ({ handleDelete, handleEdit }) => {
    return [
        {
            title: 'حوزه',
            dataIndex: ['precinct', 'title'],
            key: 'precinct'
        },
        {
            title: 'متن تجربه',
            dataIndex: 'experiment_text',
            key: 'experiment_text',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'کاربر ثبت کننده',
            dataIndex: 'user',
            key: 'user',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تاریخ ثبت',
            dataIndex: 'registration_date',
            key: 'registration_date',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'کد پروژه',
            dataIndex: 'code',
            key: 'code',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'فایل پیوست',
            dataIndex: 'file',
            key: 'file',
            render: (_, record) =>
                record.file ? (
                    <Image
                        width={70}
                        height={50}
                        src={`${BASEURL.replace("/api/v1", "")}${record.file}`}
                        alt="فایل پیوست"
                    />
                ) : (
                    "فایلی وجود ندارد"
                ),
        },
        {
            title: 'عملیات',
            render(_, record) {
                return (
                    <Space>
                        <Tooltip title="ویرایش">
                            <Button title="ویرایش" icon={<EditOutlined />} className="text-green-500 , border-green-500" onClick={() => handleEdit(record)} />
                        </Tooltip>
                        <Tooltip title="حذف">
                            <Button title="حذف" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record?.id)} />
                        </Tooltip>
                    </Space>
                )
            }
        }
    ]
}

export default ExperienceCol