import {Spin, Table} from 'antd';
import {useGetProductDocumentReport} from '@/QueryServises/ReportsQuery/index.js';
import ReportCols from '@/pages/Reports/components/CollapseTableReport/ReportCols.jsx';

const StateSpecificTable = ({productId, state, isActive}) => {
    const {data: reportData, isLoading} = useGetProductDocumentReport(
        productId,
        {
            states: state,
            with_children: true,
        },
        {
            enabled: !!productId && isActive,
        }
    );

    if (isLoading) {
        return <div style={{textAlign: 'center', margin: '20px 0'}}><Spin/></div>;
    }
    const dataSource = reportData || [];

    return (
        <Table
            getContainerWidth={window.innerWidth}
            size="small"
            scroll={{x: 100}}
            columns={ReportCols()}
            dataSource={dataSource}
            bordered
            rowKey="id"
        />
    );
};

export default StateSpecificTable;