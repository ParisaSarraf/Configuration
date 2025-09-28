import { Table } from 'antd';

const RecursiveTable = ({ dataSource, columns }) => (
    <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={false}
        expandable={{
            indentSize: 20,
            expandIconColumnIndex: 0,
            rowExpandable: (record) => record.children && record.children.length > 0,
        }}
        bordered
    />
);

export default RecursiveTable;