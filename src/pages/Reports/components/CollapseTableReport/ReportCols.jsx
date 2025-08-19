import {Tag} from "antd";

const ReportCol = () => {
    return [
        {
            title: 'نام نسخه',
            dataIndex: ['editions', 0, 'state_name'],
            key: 'state_name',
            width: 100,
            render: (record) => {
                return (<Tag color={'red'}>{record}</Tag>)
            }
        },
        {
            title: 'نام محصول',
            dataIndex: ['product', 'persian_title'],
            key: 'persian_title',
            width: 100,
        },
        {
            title: 'کد محصول',
            key: 'code',
            dataIndex: ['product', 'code'],
            width: 100,
            render: (record) => {
                return (<Tag color={'purple'}>{record}</Tag>)
            }
        },
        {
            title: 'نام سند',
            dataIndex: ['document', 'persianTitle'],
            key: 'persianTitle',
            width: 100,
            render: (record) => {
                return (<Tag color={'gold'}>{record}</Tag>)
            }
        },
        {
            title: 'نام نسخه',
            dataIndex: ['editions', 0, 'edition'],
            key: 'edition',
            width: 100,
            render: (record) => {
                return (<Tag color={'blue'}>{record}</Tag>)
            }
        }, {
            title: 'وضعیت نسخه',
            dataIndex: ['editions', 0, 'state'],
            key: 'state',
            width: 100,
            render: (record) => {
                return (<Tag color={'red'}>{record}</Tag>)
            }
        }

    ]
}

export default ReportCol