import { DeleteOutlined, EditOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Tooltip } from "antd";

const RequestOfWarehouseCol = ({ handleSend }) => {
    return [
        {
            title: 'عنوان محصول',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'تعداد کل',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تعداد مورد تایید',
            render: (_, record) => (
                <Form.Item
                    name={["confirmed_number", record.id]}
                    className="mb-0"
                  
                >
                    <Input type="number" min={0} />
                </Form.Item>
            )
        },
        {
            title: 'عملیات',
            render(_, record) {
                return (
                    <Space>
                        <Tooltip title="تایید">
                            <Button
                                title="تایید"
                                icon={<SendOutlined rotate={180} />}
                                className="text-orange-500 border-orange-500"
                                onClick={() => handleSend(record)}
                            />
                        </Tooltip>
                    </Space>
                )
            }
        }
    ];
};

export default RequestOfWarehouseCol;