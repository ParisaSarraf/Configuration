import {Card, Table} from "antd";
import {useGetActivitiesInPlanState} from "@/QueryServises/PanelQuery/index.js";
import DetailModal from "@/components/DetailModal/DetailModal.jsx";
import PlanModal from "@/pages/Activity/components/PlanModal.jsx";
import {MyPlanCols} from "@/pages/MyWork/MyPlan/MyPlanCols.jsx";
import useModal from "@/hooks/useModal.js";
import DataExporter from "@/components/DataExporter/DataExporter.jsx";

const MyPlan = () => {
    const {setModal, modalMode, modalType, modalData, closeModal, isOpen} = useModal()
    const {data: PlanData, refetch} = useGetActivitiesInPlanState();
    const expandedRowRender = (record) => {
        const columns = [
            {
                title: "نام محصول",
                dataIndex: "persian_title",
                key: "persian_title",
            },
            {
                title: "کد محصول",
                dataIndex: "code",
                key: "code",
            },
            {
                title: "تعداد",
                dataIndex: "quantity",
                key: "quantity",
            },
            {
                title: "قیمت",
                dataIndex: "price",
                key: "price",
                // render: (price) => price.toLocaleString('fa-IR'),
            },
            {
                title: "توضیحات",
                dataIndex: "description",
                key: "description",
            }
        ];
        const productData = record.product;
        return <Table columns={columns} dataSource={[productData]} pagination={false}/>;
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