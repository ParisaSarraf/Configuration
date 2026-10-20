import { Table } from 'antd';
import { TableAntd } from '../../../components/TableAntd/TableAntd';

const RecursiveTable = ({ dataSource, columns }) => (
    <TableAntd
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={{
            defaultPageSize: 5,
            pageSizeOptions: [10, 20, 45,100],
            size: "small",
            showSizeChanger: true,
        }}
        expandable={{
            indentSize: 20,
            expandIconColumnIndex: 0,
            rowExpandable: (record) => record.children && record.children.length > 0,
        }}
        bordered
    />
);

export default RecursiveTable;