import {TableAntd} from '../../../components/TableAntd/TableAntd';

const RecursiveTable = ({dataSource, columns, expandedRowKeys, onExpandedRowsChange}) => (
    <TableAntd
        className="pw-product-table"
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        scroll={{x: 960}}
        pagination={{
            defaultPageSize: 5,
            pageSizeOptions: [5, 10, 20, 45, 100],
            showSizeChanger: true,
            showTotal: (total, range) => `نمایش ${range[0].toLocaleString('fa-IR')} تا ${range[1].toLocaleString('fa-IR')} از ${total.toLocaleString('fa-IR')} مورد`,
        }}
        expandable={{
            indentSize: 20,
            expandIconColumnIndex: 1,
            expandedRowKeys,
            onExpandedRowsChange,
            rowExpandable: (record) => !!record.children?.length,
        }}
    />
);

export default RecursiveTable;
