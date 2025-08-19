import {Spin, Table} from 'antd';
import {useGetProductDocumentReport} from '@/QueryServises/ReportsQuery/index.js';
import ReportCols from '@/pages/Reports/components/CollapseTableReport/ReportCols.jsx';
import {useEffect} from "react";
import {flatten} from "@/pages/Reports/components/utils.js";

const StateSpecificTable = ({productId, state, isActive, onCountChange}) => {
    const {data: reportData, isLoading} = useGetProductDocumentReport(
        productId,
        {states: state, with_children: true},
        {enabled: !!productId},
    );

    useEffect(() => {
        if (reportData && onCountChange) {
            const count = flatten(reportData).length;
            onCountChange(state, count);
        }
    }, [reportData]);

    if (isLoading) {
        return <div style={{textAlign: 'center', margin: '20px 0'}}><Spin/></div>;
    }

    return (
        <Table
            getContainerWidth={window.innerWidth}
            size="small"
            scroll={{x: 100}}
            columns={ReportCols()}
            dataSource={reportData || []}
            bordered
            rowKey="id"
        />
    );
};

export default StateSpecificTable;