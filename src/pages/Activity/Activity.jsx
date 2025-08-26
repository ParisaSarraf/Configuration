import {Button, Card, message, Modal, Table} from "antd";
import useModal from "@/hooks/useModal.js";
import {PlusOutlined} from "@ant-design/icons";
import {ActivityCols} from "@/pages/Activity/components/ActivityCols.jsx";
import {useDeleteActivity, useGetProductActivitiesType,} from "@/QueryServises/ActivityQuery/index.js";
import ActivityModal from "@/pages/Activity/components/ActivityModal.jsx";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import TrusteeModal from "@/pages/Activity/components/TrusteeModal.jsx";
import PlanModal from "@/pages/Activity/components/PlanModal.jsx";
import {useCallback, useState} from "react";
import DetailModal from "../../components/DetailModal/DetailModal.jsx";
import {useUserSimple} from "../../QueryServises/userQuery";
import {useParams} from "react-router-dom";
import DataExporter from "@/components/DataExporter/DataExporter.jsx";
import {DocumentCol} from "@/pages/Documents/components/DocumentCol.jsx";

const Activity = () => {
    const {modalMode, setModal, isOpen, modalData, closeModal, modalType} = useModal()
    const {currentProduct} = useProductContext();
    const [filters, setFilters] = useState({});
    const {productId} = useParams();

    const {data: activityData = [], refetch} = useGetProductActivitiesType(
        productId || currentProduct?.id,
        filters
    );
    const {data: trustees = []} = useUserSimple();
    const {mutateAsync: deleteActivity} = useDeleteActivity()

    const handleDelete = useCallback((id) => {
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
        });
    }, [deleteActivity, refetch]);

    const handleEdit = useCallback((record) => {
        setModal({mode: "edit", data: record, type: 'addActivity'})
    }, [setModal]);

    const handleTrustee = useCallback((record) => {
        setModal({mode: "add", data: record, type: 'addTrustee'})
    }, [setModal]);

    const handlePlan = useCallback((record) => {
        setModal({mode: "add", data: record, type: 'addPlan'})
    }, [setModal]);

    const handleDetail = useCallback((record) => {
        setModal({mode: 'view', data: record, type: 'ActivitiesDetail'})
    }, [setModal]);

    const getRowClassName = (record) => {
        const today = new Date();
        const dueDate = record.to_date ? new Date(record.to_date) : null;
        if (record.state === 10 && dueDate && dueDate < today) {
            return 'bg-red-100 text-red-800';
        } else if (record.state === 20) {
            return 'bg-yellow-100 text-yellow-800';
        } else if (record.state === 30) {
            return 'bg-green-100 text-green-800';
        }
        return '';
    };

    const flattenData = (data) => {
        if (!data) return [];
        let flat = [];
        data.forEach(item => {
            const { children, ...rest } = item;
            flat.push(rest);
            if (children && children.length > 0) {
                flat = flat.concat(flattenData(children));
            }
        });
        return flat;
    };

    const flattenedActivityData = flattenData(activityData);

    return (
        <Card
            title={` فعالیت ها ${currentProduct?.name || ''}`}
            extra={
                <div className="flex gap-4">
                    <DataExporter
                        excelData={activityData}
                        pdfColumns={ActivityCols}
                        pdfData={flattenedActivityData}
                        fileName="لیست_فعالیت ها"
                    />
                <Button
                    className={'modal-button'}
                    onClick={() => setModal({mode: 'add', data: null, type: 'addActivity'})}
                    icon={<PlusOutlined/>}
                    title='افزودن فعالیت'
                />
                </div>
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
                    rowClassName={getRowClassName}
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
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                modalType={modalType}
            />
        </Card>
    )
}

export default Activity;