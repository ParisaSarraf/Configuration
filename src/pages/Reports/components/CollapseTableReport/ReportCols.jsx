import {Tag} from "antd";

const ReportCol = () => {
    return [
        {
            title: 'نام محصول',
            dataIndex: ['product', 'persian_title'],
            key: 'persian_title',
            width: 100,
            render: (record) => {
                return (<Tag color={'cyan'}>{record}</Tag>)
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
        // {
        //     title: 'کد محصول',
        //     key: 'code',
        //     dataIndex: ['product', 'code'],
        //     width: 100,
        //     render: (record) => {
        //         return (<Tag color={'purple'}>{record}</Tag>)
        //     }
        // },
        {
            title: 'کد سند',
            dataIndex: ['editions', 0, 'edition'],
            key: 'edition',
            width: 100,
            render: (record) => {
                return (<Tag color={'blue'}>{record}</Tag>)
            }
        },
        {
            title: 'وضعیت سند',
            dataIndex: ['editions', 0, 'state_name'],
            key: 'state_name',
            width: 100,
            render: (record) => {
                return (<Tag color={'red'}>{record}</Tag>)
            }
        },
    ]
}

export default ReportCol