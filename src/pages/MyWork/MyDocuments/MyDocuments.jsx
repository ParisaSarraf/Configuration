import { Card, Collapse, Table } from "antd";
import { useGetDocumentWorkflowTasks } from "@/QueryServises/PanelQuery/index.js";
import { CaretRightOutlined } from "@ant-design/icons";
import { getStateBackgroundColor, getStateColor, stateLabels } from "@/pages/Reports/components/utils.js";
import { useState } from "react";
import { MyDocumentCols } from "@/pages/MyWork/MyDocuments/MyDocumentCols.jsx";

const MyDocuments = () => {
    const { data: MyDocumentsData } = useGetDocumentWorkflowTasks();
    const [activeKeys, setActiveKeys] = useState([]);

    const STATES = [10, 20, 30, 40];

    return (
        <Card>
            <Collapse
                bordered={false}
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(keys)}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            >
                {STATES?.map(state => {
                    const stateColor = getStateColor(state);
                    const backgroundColor = getStateBackgroundColor(state);
                    activeKeys.includes(String(state));
                    const stateKey = String(state);
                    const items = MyDocumentsData?.[stateKey] || [];
                    return (
                        <Collapse.Panel
                            key={stateKey}
                            header={<span>{stateLabels[state]} ({items.length})</span>}
                            style={{
                                borderRight: `4px solid ${stateColor}`,
                                borderRadius: '4px',
                                background: backgroundColor,
                            }}
                        >
                            {items.length > 0 ? (
                                <Table
                                    getContainerWidth={window.innerWidth}
                                    size="small"
                                    scroll={{ x: 100 }}
                                    columns={MyDocumentCols()}
                                    dataSource={items}
                                    bordered
                                    rowKey="id"
                                    pagination={{
                                        defaultPageSize: 5,
                                        pageSizeOptions: [10, 20, 45, 100],
                                        size: "small",
                                        showSizeChanger: true,
                                    }}
                                />
                            ) : (
                                <p>هیچ داده ای برای این مرحله وجود ندارد</p>
                            )}
                        </Collapse.Panel>
                    );
                })}
            </Collapse>
        </Card>
    )
}

export default MyDocuments;