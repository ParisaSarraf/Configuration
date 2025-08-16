import {Card, Col, Row} from "antd";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import {useState} from "react";
import {useGetEditionCountReport} from "@/QueryServises/ReportsQuery/index.js";
import {DocumentStateList} from "@/pages/Reports/components/CollapseTableReport/DocumentStateList.jsx";

const Reports = () => {
    const {currentProduct} = useProductContext();

    const [filters, setFilters] = useState({
        states: [10, 20, 30, 40],
        with_children: true,
    });

    const {data, isLoading: isChartLoading, isError: isChartError} = useGetEditionCountReport(
        currentProduct?.id,
        {
            states: '10,20,30,40',
            with_children: true,
        }
    );


    console.log(data);

    const handleFilterSubmit = (formValues) => {
        setFilters(formValues);
    };

    return (
        <Card className="w-full flex flex-col">
            <Row gutter={[16, 16]}>
                {/*<Col span={24}>*/}
                {/*    <ReportForm onFinish={handleFilterSubmit} loading={isChartLoading}/>*/}
                {/*</Col>*/}

                <Col xs={24} lg={24}>
                    <DocumentStateList productId={currentProduct?.id}/>
                </Col>

                {/*<Col xs={24} lg={12}>*/}
                {/*    <ReportCharts*/}
                {/*        data={data}*/}
                {/*        isLoading={isChartLoading}*/}
                {/*        isError={isChartError}*/}
                {/*    />*/}
                {/*</Col>*/}
            </Row>
        </Card>
    );
};

export default Reports;