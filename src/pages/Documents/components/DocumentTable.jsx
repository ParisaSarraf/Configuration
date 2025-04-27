import { Table } from 'antd';
import React from 'react';
import { DocumentCol } from './DocumentCol';

const DocumentTable = ({ refetch, documentData }) => {
    const flattenData = (data) => {
        return data.reduce((acc, item) => {
            acc.push(item);
            if (item.children && item.children.length > 0) {
                acc.push(...flattenData(item.children));
            }
            return acc;
        }, []);
    };

    const tableData = documentData ? flattenData(documentData) : [];

    return (
        <div>
            <Table
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