import { Table } from 'antd';
import { DocumentCol } from './DocumentCol';

const DocumentTable = ({ documentData }) => {
    const flattenData = (data) => {
        return data.reduce((acc, item) => {
            acc.push(item);
            if (item.children && item.children.length > 0) {
                acc.push(...flattenData(item.children));
            }
            return acc;
        }, []);
    };


    return (
        <div>
            <Table
                bordered
                columns={DocumentCol}
                dataSource={documentData}
                rowKey="id"
                expandable={{
                    childrenColumnName: 'children',
                    defaultExpandAllRows: true,
                }}
            />
        </div>
    );
};

export default DocumentTable;