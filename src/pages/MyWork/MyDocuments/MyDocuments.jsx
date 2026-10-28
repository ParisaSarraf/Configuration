import { Card, Collapse, Table } from "antd";
import { useGetDocumentWorkflowTasks } from "@/QueryServises/PanelQuery/index.js";
import { CaretRightOutlined } from "@ant-design/icons";
import { getStateBackgroundColor, getStateColor, stateLabels } from "@/pages/Reports/components/utils.js";
import { useState } from "react";
import { MyDocumentCols } from "@/pages/MyWork/MyDocuments/MyDocumentCols.jsx";
import CombineFiles from "@/pages/ProductDocument/components/CombineFiles/CombineFiles.jsx";

const MyDocuments = () => {
    const {
        data: MyDocumentsData,
        refetch,
    } = useGetDocumentWorkflowTasks();
    const [activeKeys, setActiveKeys] = useState([]);
    const [workflowModal, setWorkflowModal] = useState({
        open: false,
        data: null,
        product: null,
        productId: null,
    });

    const STATES = [10, 20, 30, 40];

    const openWorkflowModal = (record, state) => {
        const productDocument = record?.product_document || {};
        const product = productDocument?.product || record?.product || {};
        const productId =
            product?.id ??
            productDocument?.product_id ??
            record?.product_id ??
            null;

        setWorkflowModal({
            open: true,
            data: {
                ...record,
                // Some API responses group tasks by state without repeating
                // the state on each row.
                state: record?.state ?? Number(state),
                product_document_id:
                    record?.product_document_id ?? productDocument?.id,
            },
            product: {
                ...product,
                id: productId,
                name:
                    product?.persian_title ||
                    product?.name ||
                    product?.title ||
                    product?.code ||
                    productDocument?.product_name ||
                    "محصول",
            },
            productId,
        });
    };

    const closeWorkflowModal = () => {
        setWorkflowModal({
            open: false,
            data: null,
            product: null,
            productId: null,
        });
    };

    return (
        <>
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
                                        scroll={{ x: 900 }}
                                        columns={MyDocumentCols((record) =>
                                            openWorkflowModal(record, state)
                                        )}
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

            <CombineFiles
                isOpen={workflowModal.open}
                modalMode="edit"
                modalType="AutomationFiles"
                modalData={workflowModal.data}
                currentProduct={workflowModal.product}
                productId={workflowModal.productId}
                closeModal={closeWorkflowModal}
                refetch={refetch}
            />
        </>
    )
}

export default MyDocuments;