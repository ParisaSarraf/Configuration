import { Table, Spin } from 'antd';
import { useGetProductDocumentReport } from '@/QueryServises/ReportsQuery/index.js';
import ReportCols from '@/pages/Reports/components/ReportCols.jsx';

const StateSpecificTable = ({ productId, state, isActive }) => {
    const { data: reportData, isLoading } = useGetProductDocumentReport(
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
        return <div style={{ textAlign: 'center', margin: '20px 0' }}><Spin /></div>;
    }
    const dataSource = reportData || [];

    return (
        <Table
            size="small"
            columns={ReportCols()}
            dataSource={dataSource}
            bordered
            rowKey="id"
        />
    );
};

export default StateSpecificTable;