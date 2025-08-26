import {Card, Table} from "antd";
import {useGetExpertActivity} from "@/QueryServises/PanelQuery/index.js";
import {MyActivitiesCols} from "@/pages/MyWork/MyActivities/MyActivitiesCols.jsx";
import {useNavigate} from "react-router-dom";
import {useProductContext} from "../../../Services/Context/ProductContext";
import useModal from "@/hooks/useModal.js";
import DetailModal from "@/components/DetailModal/DetailModal.jsx";
import TrusteeModal from "@/pages/Activity/components/TrusteeModal.jsx";
import DataExporter from "@/components/DataExporter/DataExporter.jsx";
import {DocumentCol} from "@/pages/Documents/components/DocumentCol.jsx";

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

    const expandedRowRender = (record) => {
        const isMeeting = !!record.meeting;

        const baseColumns = [
            {
                title: "نام محصول",
                dataIndex: "persian_title",
                key: "persian_title",
                render: (_, row) => row.persian_title || row.meeting?.product?.persian_title
            },
            {
                title: "کد محصول",
                dataIndex: "code",
                key: "code",
                render: (_, row) => row.code || row.meeting?.product?.code
            },
            {
                title: "تعداد",
                dataIndex: "quantity",
                key: "quantity",
                render: (_, row) => row.quantity || row.meeting?.product?.quantity
            },
            {
                title: "قیمت",
                dataIndex: "price",
                key: "price",
                render: (_, row) => row.price || row.meeting?.product?.price
            },
            {
                title: "توضیحات",
                dataIndex: "description",
                key: "description",
                render: (_, row) => row.description || row.meeting?.product?.description
            }
        ];

        const meetingColumns = [
            {
                title: "نام صورتجلسه",
                dataIndex: ["meeting", "title"],
                key: "meeting_title"
            },
            {
                title: "کد صورتجلسه",
                dataIndex: ["meeting", "full_code"],
                key: "meeting_code"
            }
        ];
        const columns = isMeeting
            ? [...meetingColumns, ...baseColumns]
            : baseColumns;
        const productData = record.product || record.meeting?.product;
        return productData ? (
            <Table
                columns={columns}
                dataSource={[productData]}
                pagination={false}
                rowKey="id"
            />
        ) : null;
    };

    return (
        <Card>
             <DataExporter
                excelData={MyActivitiesData}
                pdfColumns={MyActivitiesCols}
                // pdfData={flattenedDocumentData}
                fileName="لیست_اسناد"
                />
            <Table
                expandedRowRender={expandedRowRender}
                dataSource={MyActivitiesData || []}
                pagination={false}
                scroll={{y: 300}}
                columns={MyActivitiesCols({handleShowDetail, handleTrustee})}
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
                // currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
            />
        </Card>
    )
}
export default MyActivities;