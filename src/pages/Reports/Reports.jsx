import {Col, Row} from "antd";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import {DocumentStateList} from "@/pages/Reports/components/CollapseTableReport/DocumentStateList.jsx";
import ReportCharts from "@/pages/Reports/components/PieChartReport/ReportCharts.jsx";

const Reports = () => {
    const {currentProduct} = useProductContext();
    const ProductIds = currentProduct?.id

    return (
        <div className="w-full flex flex-col">
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={24}>
                    <DocumentStateList productId={ProductIds}/>
                </Col>
                <Col xs={24} lg={24}>
                    <ReportCharts productId={ProductIds}/>
                </Col>
            </Row>
        </div>
    );
};

export default Reports;
