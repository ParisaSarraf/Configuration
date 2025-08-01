import {
    Checkbox,
    Col,
    Form,
    Input,
    message,
    Row,
    Select,
    Steps,
    Button,
    Modal as AntModal,
    Descriptions,
    Avatar,
    Popover
} from "antd";
import {UserOutlined, EyeOutlined} from '@ant-design/icons';
import Modal from "../../../../components/Modal";
import {
    useCreateProductDocumentEdition,
    useUpdateProductDocumentEdition,
    useProductDocumentTreeById
} from "@/QueryServises/productDocumentQuery/index.js";
import {useEffect, useState} from "react";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import {BASEURL} from "../../../../Services/axiosInstance";
import {usePatchDocumentEditionLog} from "../../../../QueryServises/productDocumentEditionLogQuery";
import {useLogList} from "@/QueryServises/LogQuery/index.js";

const ProductDocumentEditionModal = ({
                                         isOpen,
                                         modalMode,
                                         modalData,
                                         closeModal,
                                         refetch,
                                         currentProduct
                                     }) => {
    const [form] = Form.useForm();
    const [currentState, setCurrentState] = useState(null);
    const [comment, setComment] = useState("");
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const {isPending: isCreating, mutateAsync: createProductDocumentEdition} =
        useCreateProductDocumentEdition();
    const {isPending: isUpdating, mutateAsync: updateProductDocumentEdition} =
        useUpdateProductDocumentEdition();
    const {mutateAsync: updateState, isPending: isPatching} = usePatchDocumentEditionLog();
    const {data: logList = []} = useLogList({
        id: modalData?.id,
        model: 'product_document_edition',
        state: currentState
    });

    const getLogsForState = (stateValue) => {
        return logList?.filter(log => log.to_state === stateValue) || [];
    };

    const getLastLogForState = (stateValue) => {
        const logs = getLogsForState(stateValue);
        if (!logs.length) return null;
        return logs.reduce((latest, current) =>
            new Date(current.changed_at) > new Date(latest.changed_at) ? current : latest
        );
    };

    const stateSteps = [
        {value: 10, label: "تهیه نشده", log: getLastLogForState(10), logs: getLogsForState(10)},
        {value: 20, label: "تهیه کننده", log: getLastLogForState(20), logs: getLogsForState(20)},
        {value: 30, label: "تایید", log: getLastLogForState(30), logs: getLogsForState(30)},
        {value: 40, label: "تصدیق", log: getLastLogForState(40), logs: getLogsForState(40)},
    ];

    const currentStepIndex = stateSteps.findIndex(s => s.value === currentState);
    const isEditable = modalMode === "edition" || currentState === 10;

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                edition: modalData?.edition,
                file_1: modalData.file_1 ? [{
                    uid: "-1",
                    name: "file_1",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_1,
                }] : [],
                file_2: modalData.file_2 ? [{
                    uid: "-1",
                    name: "file_2",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_2,
                }] : [],
                file_3: modalData.file_3 ? [{
                    uid: "-1",
                    name: "file_3",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_3,
                }] : [],
                file_4: modalData.file_4 ? [{
                    uid: "-1",
                    name: "file_4",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_4,
                }] : [],
                description: modalData?.description,
            });
            setCurrentState(modalData.state);
        } else {
            form.resetFields();
            setCurrentState(null);
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        if (!isEditable) return;

        const payload = {
            product_document_id: modalData?.product_document_id?.id || currentProduct?.id,
            edition: values.edition,
            file_1: values.file_1?.[0]?.originFileObj,
            file_2: values.file_2?.[0]?.originFileObj,
            file_3: values.file_3?.[0]?.originFileObj,
            file_4: values.file_4?.[0]?.originFileObj,
            description: values.description,
            state: currentState,
        };

        try {
            if (modalMode === "edition") {
                await createProductDocumentEdition(payload);
                message.success("نسخه جدید با موفقیت اضافه شد");
            } else {
                await updateProductDocumentEdition({
                    documentId: modalData?.id,
                    ...payload
                });
                message.success("نسخه با موفقیت ویرایش شد");
            }
            refetch();
            closeModal();
        } catch (error) {
            const errorMessage =
                error.response?.data?.detail ||
                "عملیات موفقیت آمیز نبود، دوباره امتحان کنید";
            message.error(errorMessage);
        }
    };

    const handleNextStep = async () => {
        if (currentStepIndex >= stateSteps.length - 1) return;
        const nextState = stateSteps[currentStepIndex + 1].value;

        try {
            await updateState({
                id: modalData?.id,
                state: nextState,
                comment: comment,
            });
            message.success("مرحله با موفقیت بروزرسانی شد");
            setCurrentState(nextState);
            setComment("");
            refetch();
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.detail || "خطا در بروزرسانی مرحله");
        }
    };

    const handlePrevStep = async () => {
        if (currentStepIndex <= 0) return;
        const prevState = stateSteps[currentStepIndex - 1].value;

        try {
            await updateState({
                id: modalData?.id,
                state: prevState,
                comment: comment,
            });
            message.success(`به مرحله "${stateSteps.find(s => s.value === prevState).label}" منتقل شد`);
            setCurrentState(prevState);
            setComment("");
            refetch();
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.detail || "خطا در بازگردانی مرحله");
        }
    };

    const showLogDetails = (log) => {
        setSelectedLog(log);
        setDetailModalVisible(true);
    };

    const CustomStep = ({title, log, logs}) => {
        const user = log?.changed_by;
        const userName = user ? `${user.name} ${user.last_name}` : null;

        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div>{title}</div>
                {log && (
                    <Popover
                        title="تاریخچه این مرحله"
                        content={
                            <div style={{maxHeight: 200, overflowY: 'auto', direction: 'rtl', width: 250}}>
                                {logs?.map((l) => (
                                    <div key={l.id} style={{
                                        marginBottom: 8,
                                        borderBottom: '1px solid #f0f0f0',
                                        paddingBottom: 4,
                                        fontSize: '12px'
                                    }}>
                                        <div>{l.changed_by?.name} {l.changed_by?.last_name}</div>
                                        <div>{new Date(l.changed_at).toLocaleString('fa-IR')}</div>
                                        <div>{l.comment || 'بدون توضیح'}</div>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#888',
                                marginTop: 4
                            }}
                        >
                            <Avatar size="small" icon={<UserOutlined/>}
                                    src={user?.signature_image || user?.temp_image}/>
                            <span>{userName || 'نامشخص'}</span>
                            <EyeOutlined style={{fontSize: '10px'}}/>
                        </div>
                    </Popover>
                )}
            </div>
        );
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edition" ? "افزودن" : "ویرایش"} نسخه`}
                size={700}
                onClose={closeModal}
                onSubmit={isEditable ? () => form.submit() : undefined}
                mode={modalMode}
                loading={isCreating || isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={onFinishForm} disabled={!isEditable}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="نام نسخه" name="edition"
                                       rules={[{required: true, message: "لطفا نام نسخه را انتخاب کنید"}]}>
                                <Select
                                    options={Array.from({length: 26}, (_, i) => ({
                                        value: String.fromCharCode(97 + i).toUpperCase(),
                                        label: String.fromCharCode(97 + i).toUpperCase()
                                    }))}
                                    placeholder="انتخاب کنید"
                                    disabled={!isEditable || modalMode !== "edition"}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="توضیح" name="description">
                                <Input.TextArea placeholder="توضیحات نسخه را وارد کنید" disabled={!isEditable}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}><Form.Item label={'فایل غیرقابل ویرایش'} name='file_1'><FileUploader maxCount={1}
                                                                                                           disabled={!isEditable}/></Form.Item></Col>
                        <Col span={6}><Form.Item label={'قابل ویرایش'} name='file_2'><FileUploader maxCount={1}
                                                                                                   disabled={!isEditable}/></Form.Item></Col>
                        <Col span={6}><Form.Item label={'فایل پشتیبان تولید'} name='file_3'><FileUploader maxCount={1}
                                                                                                          disabled={!isEditable}/></Form.Item></Col>
                        <Col span={6}><Form.Item label={'ارسال به کارفرما/پیمانکار'} name='file_4'><FileUploader
                            maxCount={1} disabled={!isEditable}/></Form.Item></Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Steps
                                size="small"
                                current={currentStepIndex}
                                items={stateSteps.map((step) => ({
                                    title: <CustomStep title={step.label} log={step.log} logs={step.logs}/>
                                }))}
                            />
                        </Col>

                        {modalMode === "edit" && (
                            <>
                                <Col span={24}>
                                    <Form.Item label="توضیح">
                                        <Input.TextArea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="توضیح مربوط به این مرحله را وارد کنید"
                                            disabled={isPatching}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24} style={{textAlign: "left", display: "flex", gap: "8px"}}>
                                    <Button onClick={handlePrevStep}
                                            disabled={!comment || currentStepIndex <= 0 || isPatching}
                                            loading={isPatching}>مرحله قبلی</Button>
                                    <Button type="primary" onClick={handleNextStep}
                                            disabled={!comment || currentStepIndex >= stateSteps.length - 1 || isPatching}
                                            loading={isPatching}>مرحله بعد</Button>
                                </Col>
                            </>
                        )}
                    </Row>
                </Form>
            </Modal>

            <AntModal
                title="جزئیات تغییر وضعیت"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
            >
                {selectedLog && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="کاربر">
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <Avatar size="default" icon={<UserOutlined/>}
                                        src={selectedLog.changed_by?.signature_image || selectedLog.changed_by?.temp_image}/>
                                <span>{selectedLog.changed_by?.name} {selectedLog.changed_by?.last_name}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="از مرحله">{stateSteps.find(s => s.value === selectedLog.from_state)?.label || selectedLog.from_state}</Descriptions.Item>
                        <Descriptions.Item
                            label="به مرحله">{stateSteps.find(s => s.value === selectedLog.to_state)?.label || selectedLog.to_state}</Descriptions.Item>
                        <Descriptions.Item
                            label="تاریخ تغییر">{new Date(selectedLog.changed_at).toLocaleString('fa-IR')}</Descriptions.Item>
                        <Descriptions.Item label="توضیحات">{selectedLog.comment || 'بدون توضیح'}</Descriptions.Item>
                    </Descriptions>
                )}
            </AntModal>
        </>
    );
};

export default ProductDocumentEditionModal;
