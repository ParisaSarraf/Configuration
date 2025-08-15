import { Card, Collapse, Row, Col } from "antd";
import { useProductContext } from "@/Services/Context/ProductContext.jsx";
import { useState } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import StateSpecificTable from "@/pages/Reports/components/StateSpecificTable.jsx";

const getStateColor = (state) => {
    const colors = {
        10: 'blue',
        20: 'green',
        30: 'orange',
        40: 'red',
        50: 'purple',
    };
    return colors[state] || 'gray';
};

const Reports = () => {
    const { currentProduct } = useProductContext();
    const [activeKeys, setActiveKeys] = useState([]);

    const ALL_STATES = [10, 20, 30, 40];

    const stateLabels = {
        10: 'تهیه نشده',
        20: 'تهیه کننده',
        30: 'تایید',
        40: 'تصویب',
    };

    return (
        <Card className="w-full flex flex-col">
            <Row gutter={16}>
                <div className={'w-full flex flex-col'}>
                    <Col span={24}>
                        <Collapse
                            bordered={false}
                            activeKey={activeKeys}
                            onChange={(keys) => setActiveKeys(keys)}
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                        >
                            {ALL_STATES.map(state => {
                                const stateColor = getStateColor(state);
                                const isActive = activeKeys.includes(String(state));

                                return (
                                    <Collapse.Panel
                                        key={String(state)}
                                        header={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span>وضعیت: {stateLabels[state]}</span>
                                            </div>
                                        }
                                        style={{
                                            marginBottom: 16,
                                            borderRight: `4px solid ${stateColor}`,
                                            borderRadius: '4px',
                                            background: '#f7f7f7'
                                        }}
                                    >
                                        <StateSpecificTable
                                            productId={currentProduct?.id}
                                            state={state}
                                            isActive={isActive}
                                        />
                                    </Collapse.Panel>
                                );
                            })}
                        </Collapse>
                    </Col>
                </div>
            </Row>
        </Card>
    );
}

export default Reports;