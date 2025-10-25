import {Card, Table} from "antd";
import {useGetExpertActivity} from "@/QueryServises/PanelQuery/index.js";
import {MyActivitiesCols} from "@/pages/MyWork/MyActivities/MyActivitiesCols.jsx";
import {useNavigate} from "react-router-dom";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import useModal from "@/hooks/useModal.js";
import DetailModal from "@/components/DetailModal/DetailModal.jsx";
import TrusteeModal from "@/pages/Activity/components/TrusteeModal.jsx";

const MyActivities = () => {
    const {setModal, modalMode, modalType, modalData, closeModal, isOpen} = useModal()
    const {data: MyActivitiesData, refetch} = useGetExpertActivity()
    const navigate = useNavigate();
    const {handleProductSelect} = useProductContext();

    const handleShowDetail = (record) => {
        setModal({mode: 'view', data: record, type: 'ActivitiesDetail'});
    }

    const handleTrustee = (record) => {
        setModal({mode: "add", data: record, type: 'addTrustee'})
    }

    const columns = MyActivitiesCols({handleShowDetail, handleTrustee});

    return (
        <Card
            // extra={
            //     <DataExporter
            //         excelData={MyActivitiesData}
            //         excelColumns={columns}
            //         fileName="لیست_فعالیت‌های_من"
            //     />
            // }
        >

            <Table
                dataSource={MyActivitiesData || []}
                pagination={{
                    defaultPageSize: 5,
                    pageSizeOptions: [10, 20, 45, 100],
                    size: "small",
                    showSizeChanger: true,
                }}
                scroll={{y: 300}}
                // bordered
                columns={columns}
                size={"small"}
                rowKey={record => record.id}
                onRow={(record) => {
                    const product = record.product || record.meeting?.product;
                    return {
                        onClick: () => {
                            if (product) {
                                handleProductSelect(product);
                                navigate(`/`);
                            }
                        }
                    };
                }}
            />
            <DetailModal
                isOpen={modalType === 'ActivitiesDetail' && isOpen}
                modalType={modalType}
                modalData={modalData}
                modalMode={modalMode}
                closeModal={closeModal}
            />
            <TrusteeModal
                isOpen={modalType === 'addTrustee' && isOpen}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
            />
        </Card>
    )
}
export default MyActivities;