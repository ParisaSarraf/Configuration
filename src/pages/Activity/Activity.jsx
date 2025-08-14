import {Button, Card, message, Modal, Table} from "antd";
import useModal from "@/hooks/useModal.js";
import {PlusOutlined} from "@ant-design/icons";
import {ActivityCols} from "@/pages/Activity/components/ActivityCols.jsx";
import {
    useDeleteActivity,
    useGetProductActivitiesType,
} from "@/QueryServises/ActivityQuery/index.js";
import ActivityModal from "@/pages/Activity/components/ActivityModal.jsx";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import TrusteeModal from "@/pages/Activity/components/TrusteeModal.jsx";
import PlanModal from "@/pages/Activity/components/PlanModal.jsx";
import {useState} from "react";
import DetailModal from "../Meetings/components/DetailModal";
import {useUserSimple} from "../../QueryServises/userQuery";

const Activity = () => {
    const {modalMode, setModal, isOpen, modalData, closeModal, modalType} = useModal()
    const {currentProduct} = useProductContext();
    const [filters, setFilters] = useState({});
    const {data: activityData = [], refetch} = useGetProductActivitiesType(
        currentProduct?.id,
        filters
    );
    // const { data: activityData = [], refetch } = useGetProductActivities(currentProduct?.id)
    const {data: trustees = []} = useUserSimple();


    const {mutateAsync: deleteActivity} = useDeleteActivity()


    const handleDelete = (id) => {
        Modal.confirm({
            title: 'حذف فعالیت',
            content: 'آیا از حذف این فعالیت مطمئن هستید؟',
            okText: 'بله',
            cancelText: 'خیر',
            okType: 'danger',
            onOk() {
                return new Promise((resolve, reject) => {
                    deleteActivity(id, {
                        onSuccess: () => {
                            message.success("فعالیت با موفقیت حذف شد");
                            refetch();
                            resolve();
                        },
                        onError: () => {
                            message.error("حذف فعالیت با خطا مواجه شد");
                            reject();
                        },
                    });
                });
            },
            onCancel() {
                console.log('حذف لغو شد');
            },
        });
    };

    const handleEdit = (record) => {
        setModal({mode: "edit", data: record, type: 'addActivity'})
    }

    const handleTrustee = (record) => {
        setModal({mode: "add", data: record, type: 'addTrustee'})
    }

    const handlePlan = (record) => {
        setModal({mode: "add", data: record, type: 'addPlan'})
    }

    const handleDetail = (record) => {
        setModal({mode: 'view', data: record, type: 'ActivitiesDetail'})

    }

    const isPastDueWithState10 = (record) => {
        if (record.state !== 10) return false;
        if (!record.to_date) return false;
        const today = new Date();
        const dueDate = new Date(record.to_date);

        return dueDate < today;
    };

    return (
        <Card
            title={` فعالیت ها ${currentProduct?.name || ''}`}
            extra={
                <Button
                    className={'modal-button'}
                    onClick={() => setModal({mode: 'add', data: null, type: 'addActivity'})}
                    icon={<PlusOutlined/>}
                    title='افزودن فعالیت'
                />
            }>
            <div className={'flex flex-col gap-4'}>
                <Table
                    size="small"
                    dataSource={activityData}
                    columns={ActivityCols({
                        handleEdit,
                        handleDelete,
                        handleTrustee,
                        handlePlan,
                        handleDetail,
                        trustees,
                        setFilters
                    })}
                    rowKey="id"
                    rowClassName={(record) => isPastDueWithState10(record) ? 'bg-red-100' : ''}
                />
            </div>

            <ActivityModal
                isOpen={modalType === 'addActivity' && isOpen}
                currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
                modalType={modalType}

            />
            <TrusteeModal
                isOpen={modalType === 'addTrustee' && isOpen}
                currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
            />
            <PlanModal
                isOpen={modalType === 'addPlan' && isOpen}
                currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
            />

            <DetailModal
                isOpen={modalType === 'ActivitiesDetail' && isOpen}
                // currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                modalType={modalType}
                // refetch={refetch}
            />
        </Card>
    )
}

export default Activity;