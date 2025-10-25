import {Card, Table, Tag, Tooltip} from "antd";
import {useGetActivitiesInPlanState} from "@/QueryServises/PanelQuery/index.js";
import DetailModal from "@/components/DetailModal/DetailModal.jsx";
import PlanModal from "@/pages/Activity/components/PlanModal.jsx";
import {MyPlanCols} from "@/pages/MyWork/MyPlan/MyPlanCols.jsx";
import useModal from "@/hooks/useModal.js";
import DataExporter from "@/components/DataExporter/DataExporter.jsx";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";

const MyPlan = () => {
    const {setModal, modalMode, modalType, modalData, closeModal, isOpen} = useModal()
    const {data: PlanData, refetch} = useGetActivitiesInPlanState();
    const expandedRowRender = (record) => {
        const columns = [{
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
            // {
            //     title: 'نوع فعالیت',
            //     dataIndex: 'type',
            //     key: 'type',
            //     render: (type) => {
            //         return (
            //             <Tag>{type === 'control project' ? 'کنترل پروژه' : 'صورتجلسه'}</Tag>
            //         )
            //     },
            // },
            {
                title: 'مسئول',
                key: 'trustee',
                render: (text, record) => {
                    const trusteeName = record.trustee?.name || '';
                    const trusteeLastName = record.trustee?.last_name || '';
                    return `${trusteeName} ${trusteeLastName}`.trim() || '---';
                },
            },
            {
                title: 'کد فعالیت',
                dataIndex: 'full_code',
                key: 'full_code',
                render: (type) => {
                    return (
                        <Tag>{type}</Tag>
                    )
                },
            },
            {
                title: "نام محصول",
                key: "persian_title",
                render: (_, row) => {
                    return row.product?.persian_title || row.meeting?.product?.persian_title;
                }
            },
            // {
            //     title: "کد محصول",
            //     key: "code",
            //     render: (_, row) => row.product?.code || row.meeting?.product?.code
            // },
            {
                title: 'شرح فعالیت',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
                render: (description) => {
                    return (
                        <Tooltip title={description}>
                            <Tag
                                color="purple"
                                style={{
                                    maxWidth: 150,
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {description}
                            </Tag>
                        </Tooltip>
                    );
                },
            },
            {
                title: 'تاریخ پایان',
                dataIndex: 'to_date',
                key: 'to_date',
                render: (record) => {
                    return (
                        <Tag color="blue">{georgianDateToJalaliDate(record)}</Tag>
                    )
                },
            },
            {
                title: 'تاریخ تایید',
                dataIndex: 'done_date',
                key: 'done_date',
                render: (record) => {
                    return (
                        <Tag color="green">{georgianDateToJalaliDate(record)}</Tag>
                    )
                },
            },
        ]
        const productData = record.product;
        return <Table columns={columns} dataSource={[productData]}
                      pagination={{
                          defaultPageSize: 5,
                          pageSizeOptions: [10, 20, 45, 100],
                          size: "small",
                          showSizeChanger: true,
                      }}
        />;
    };

    const handleShowDetail = (record) => {
        setModal({mode: 'view', data: record, type: 'ActivitiesDetail'});
    }
    const handlePlan = (record) => {
        setModal({mode: "add", data: record, type: 'addPlan'})
    }
    return (
        <Card extra={
            <DataExporter
                excelData={PlanData}
                excelColumns={MyPlanCols}
                fileName="لیست_کارهای_من"
            />
        }>
            <Table
                pagination={false}
                scroll={{y: 300}}
                dataSource={PlanData || []}
                columns={MyPlanCols({handleShowDetail, handlePlan})}
                expandable={{expandedRowRender}}
                rowKey="id"
            />
            <DetailModal
                isOpen={modalType === 'ActivitiesDetail' && isOpen}
                modalType={modalType}
                modalData={modalData}
                modalMode={modalMode}
                closeModal={closeModal}
            />
            <PlanModal
                isOpen={modalType === 'addPlan' && isOpen}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
            />
        </Card>
    );
}

export default MyPlan;