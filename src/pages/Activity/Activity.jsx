import {Button, Card, message, Modal, Table, Segmented} from "antd";
import useModal from "@/hooks/useModal.js";
import {FileExcelOutlined, PlusOutlined} from "@ant-design/icons";
import {ActivityCols} from "@/pages/Activity/components/ActivityCols.jsx";
import {
    useDeleteActivity,
    useGetProductActivitiesType,
} from "@/QueryServises/ActivityQuery/index.js";
import ActivityModal from "@/pages/Activity/components/ActivityModal.jsx";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import TrusteeModal from "@/pages/Activity/components/TrusteeModal.jsx";
import PlanModal from "@/pages/Activity/components/PlanModal.jsx";
import {useCallback, useState} from "react";
import DetailModal from "../../components/DetailModal/DetailModal.jsx";
import {useUserSimple} from "../../QueryServises/userQuery";
import {useParams} from "react-router-dom";
import { useExportExcelActivity } from "../../QueryServises/ExcelExporterQuery/index.js";
import {handleDownload} from "@utils/HandleDownload.js";

const stateOptions = [
    {
        label: "همه فعالیت ها",
        value: undefined,
    },
    {
        label: "در دست متولی",
        value: 10,
    },
    {
        label: "در دست طرح و برنامه",
        value: 20,
    },
    {
        label: "تکمیل شده",
        value: 30,
    },
];

const Activity = () => {
    const {modalMode, setModal, isOpen, modalData, closeModal, modalType} =
        useModal();
    const {currentProduct} = useProductContext();
    const [filters, setFilters] = useState({});
    const {productId} = useParams();
    
    const {data: exportExcel, isLoading: isExporting, refetch: exportRefetch} = useExportExcelActivity(currentProduct?.id, {
        enabled: false
    });

    const {data: activityData = [], refetch , isLoading} = useGetProductActivitiesType(
        productId || currentProduct?.id,
        filters
    );
    const {data: trustees = []} = useUserSimple();
    const {mutateAsync: deleteActivity} = useDeleteActivity();

    const handleDelete = useCallback(
        (id) => {
            Modal.confirm({
                title: "حذف فعالیت",
                content: "آیا از حذف این فعالیت مطمئن هستید؟",
                okText: "بله",
                cancelText: "خیر",
                okType: "danger",
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
        },
        [deleteActivity, refetch]
    );

    const handleEdit = useCallback(
        (record) => {
            setModal({mode: "edit", data: record, type: "addActivity"});
        },
        [setModal]
    );

    const handleTrustee = useCallback(
        (record) => {
            setModal({mode: "add", data: record, type: "addTrustee"});
        },
        [setModal]
    );

    const handlePlan = useCallback(
        (record) => {
            setModal({mode: "add", data: record, type: "addPlan"});
        },
        [setModal]
    );

    const handleDetail = useCallback(
        (record) => {
            setModal({mode: "view", data: record, type: "ActivitiesDetail"});
        },
        [setModal]
    );

    const getRowClassName = (record) => {
        const today = new Date();
        const dueDate = record.to_date ? new Date(record.to_date) : null;
        if (record.state === 10 && dueDate && dueDate < today) {
            return "bg-red-100 text-red-800";
        } else if (record.state === 20) {
            return "bg-yellow-100 text-yellow-800";
        } else if (record.state === 30) {
            return "bg-green-100 text-green-800";
        }
        return "";
    };

    const handleAddSubActivity = (record) => {
        setModal({mode: "add", data: record, type: "AddSubActivity"});
    };

    const handleExcelExport = async () => {
        if (!currentProduct?.id) {
            message.error("برای خروجی اکسل، محصول باید انتخاب شده باشد");
            return;
        }
        try {
            const result = await exportRefetch();
            
            if (result.data) {
                handleDownload(result.data, `_فعالیت‌های_${currentProduct.name || currentProduct.id}.csv`);
                message.success("خروجی اکسل با موفقیت دانلود شد");
            }
        } catch (error) {
            console.error('Error in Excel export:', error);
            message.error("خطا در دریافت خروجی اکسل");
        }
    };

    const columns = ActivityCols({
        handleEdit,
        handleDelete,
        handleTrustee,
        handlePlan,
        handleDetail,
        handleAddSubActivity,
        trustees,
        setFilters,
    });

    return (
        <Card
            title={` فعالیت ها ${currentProduct?.name || ""}`}
            extra={
                <div className={"w-full flex flex-row gap-2"}>
                    <Button
                        title={'خروجی اکسل'}
                        className={'text-green-500 border-green-500 mt-2'}
                        onClick={handleExcelExport}
                        icon={<FileExcelOutlined />}
                        loading={isExporting}
                    />

                    <div>
                        <Button
                            className={"modal-button mt-1.5"}
                            onClick={() =>
                                setModal({mode: "add", data: null, type: "addActivity"})
                            }
                            icon={<PlusOutlined/>}
                            title="افزودن فعالیت"
                        />
                    </div>
                </div>
            }
        >
            <div className={"flex flex-col gap-4"}>

                <div className="flex justify-start mb-4">
                    <Segmented
                        options={stateOptions}
                        value={filters.states}
                        onChange={(value) => {
                            setFilters(prevFilters => ({
                                ...prevFilters,
                                states: value,
                            }));
                        }}
                    />
                </div>
                <Table
                    size="small"
                    dataSource={activityData}
                    columns={columns}
                    bordered
                    rowKey="id"
                    loading={isLoading}
                    rowClassName={getRowClassName}
                    pagination={{
                        defaultPageSize: 5,
                        pageSizeOptions: [10, 20, 45,100],
                        size: "small",
                        showSizeChanger: true,
                    }}
                />
            </div>

            <ActivityModal
                isOpen={
                    modalType === "addActivity" ||
                    (modalType === "AddSubActivity" && isOpen)
                }
                currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
                modalType={modalType}
            />
            <TrusteeModal
                isOpen={modalType === "addTrustee" && isOpen}
                currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
            />
            <PlanModal
                isOpen={modalType === "addPlan" && isOpen}
                currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
            />
            <DetailModal
                isOpen={modalType === "ActivitiesDetail" && isOpen}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                modalType={modalType}
            />
        </Card>
    );
};

export default Activity;