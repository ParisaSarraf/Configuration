import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {Button} from "antd";

export const SerialListCol = (handleEditProductSerial, handleDeleteProductSerial) => [
    {
        title: 'ردیف',
        render: (text, record, index) => index + 1,
    },
    {
        title: 'سریال',
        dataIndex: 'full_serial',
        key: 'full_serial',
    },
    {
        title: 'تاریخ',
        dataIndex: 'date',
        key: 'date',
        // render: (text, record) => {
        //     return (
        //         <>
        //             {georgianDateToJalaliDate(record.date)}
        //         </>
        //     )
        // },
    },
    {
        title: 'عملیات',
        render: (text, record) => (
            <div className="flex flex-row gap-2 justify-center">
                <Button
                    icon={<EditOutlined/>}
                    className="border border-green-600 text-green-600"
                    onClick={() => handleEditProductSerial(record)}
                    size="small"
                />
                <Button
                    icon={<DeleteOutlined/>}
                    danger
                    onClick={() => handleDeleteProductSerial(record.id)}
                    size="small"
                />
            </div>
        ),
    },
];