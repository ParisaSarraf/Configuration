import {Spin, Table} from 'antd';
import {useGetProductDocumentReport} from '@/QueryServises/ReportsQuery/index.js';
import ReportCols from './ReportCols.jsx';

const StateSpecificTable = ({productId, state, filters = {}}) => {
    let finalFilters = {...filters};
    if (state !== null) {
        finalFilters.states = state;
    } else {
        delete finalFilters.states;
    }

    const {data: reportData, isLoading} = useGetProductDocumentReport(
        productId,
        finalFilters,
        {
            enabled: !!productId,
        }
    );

    if (isLoading) {
        return <div style={{textAlign: 'center', margin: '20px 0'}}><Spin/></div>;
    }
    return (
        <Table
            size="small"
            scroll={{x: 'max-content'}}
            columns={ReportCols()}
            dataSource={reportData || []}
            bordered
            rowKey="id"
            pagination={{
                defaultPageSize: 5,
                pageSizeOptions: [10, 20, 45,100],
                size: "small",
                showSizeChanger: true,
            }}
        />
    );
};

export default StateSpecificTable;