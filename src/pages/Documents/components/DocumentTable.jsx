import {ConfigProvider, Table} from 'antd';
import {DocumentCol} from './DocumentCol';
import fa_IR from 'antd/locale/fa_IR';


const DocumentTable = ({documentData}) => {

    return (
        <div>
            <ConfigProvider direction="rtl" locale={fa_IR}>

                <Table
                    bordered
                    columns={DocumentCol}
                    dataSource={documentData}
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
                        rowExpandable: (record) => record.children && record.children.length > 0
                    }}
                />
            </ConfigProvider>
        </div>
    );
};

export default DocumentTable;