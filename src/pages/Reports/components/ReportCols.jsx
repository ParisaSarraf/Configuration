import {Tag} from "antd";

const ReportCol = () => {
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
            render: (record) =>
            {
                return (<Tag color={'purple'}>{record}</Tag>)
            }
        },
        {
            title: 'نام سند',
            dataIndex: ['document', 'persianTitle'],
            key: 'persianTitle',
            render: (record) => {
                return (<Tag color={'gold'}>{record}</Tag>)
            }
        },
        {
            title: 'نام نسخه',
            dataIndex: ['editions',0, 'edition'],
            key: 'edition',
            render: (record) => {
                return (<Tag color={'blue' }>{record}</Tag>)
            }
        }, {
            title: 'وضعیت نسخه',
            dataIndex: ['editions',0, 'state'],
            key: 'state',
            render: (record) => {
                return (<Tag color={'red' }>{record}</Tag>)
            }
        },

    ]
}

export default ReportCol