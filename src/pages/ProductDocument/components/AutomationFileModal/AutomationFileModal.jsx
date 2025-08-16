import Modal from "@/components/Modal/index.jsx";
import {Avatar, Button, Col, Descriptions, Form, Input, message, Modal as AntModal, Popover, Row, Steps} from "antd";
import {useEffect, useState} from "react";
import {EyeOutlined, FileOutlined, UserOutlined} from "@ant-design/icons";
import {usePatchDocumentEditionLog} from "@/QueryServises/productDocumentEditionLogQuery";
import {useLogList} from "@/QueryServises/LogQuery/index.js";
import {BASEURL} from "@/Services/axiosInstance.js";

const AutomationFileModal = ({isOpen, modalData, closeModal, modalMode}) => {
    const [currentState, setCurrentState] = useState(null);
    const [comment, setComment] = useState("");
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const {mutateAsync: updateState, isPending: isPatching} = usePatchDocumentEditionLog();

    const {data: logList = []} = useLogList({
        id: modalData?.id,
        model: "product_document_edition",
        state: currentState,
    });

    useEffect(() => {
        if (modalData?.state) {
            setCurrentState(modalData.state);
        }
    }, [modalData]);

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
        {value: 10, label: "تعریف سند"},
        {value: 20, label: "تهیه کننده"},
        {value: 30, label: "تایید"},
        {value: 40, label: "تصویب"},
    ].map(step => {
        const relatedLogs = logList?.filter(log => log.to_state >= step.value);
        const lastLog = getLastLogForState(step.value);
        return {
            ...step,
            logs: relatedLogs,
            log: lastLog,
        };
    });


    const currentStepIndex = stateSteps?.findIndex(s => s.value === currentState);

    const handleNextStep = async () => {
        if (currentStepIndex >= stateSteps?.length - 1) return;
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
            message.success(`به مرحله "${stateSteps?.find(s => s.value === prevState).label}" منتقل شد`);
            setCurrentState(prevState);
            setComment("");
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.detail || "خطا در بازگردانی مرحله");
        }
    };

    const CustomStep = ({title, log, logs}) => {
        return (
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div>{title}</div>
                {logs?.length > 0 && (
                    <Popover
                        title="تاریخچه مراحل قبلی تا این مرحله"
                        content={
                            <div style={{maxHeight: 200, overflowY: "auto", direction: "rtl", width: 300}}>
                                {logs?.map((l) => (
                                    <div
                                        key={l.id}
                                        style={{
                                            marginBottom: 8,
                                            borderBottom: "1px solid #f0f0f0",
                                            paddingBottom: 4,
                                            fontSize: "12px",
                                        }}
                                    >
                                        <div>
                                            {l.changed_by?.name} {l.changed_by?.last_name} -
                                            مرحله: {stateSteps?.find(s => s.value === l.to_state)?.label || l.to_state}
                                        </div>
                                        <div>{new Date(l.changed_at).toLocaleString("fa-IR")}</div>
                                        <div>{l.comment || "بدون توضیح"}</div>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                color: "#888",
                                marginTop: 4,
                            }}
                        >
                            <Avatar size="small" icon={<UserOutlined/>}
                                    src={log?.changed_by?.signature_image || log?.changed_by?.temp_image}/>
                            <span>{log ? `${log.changed_by?.name} ${log.changed_by?.last_name}` : "نامشخص"}</span>
                            <EyeOutlined style={{fontSize: "10px"}}/>
                        </div>
                    </Popover>
                )}
            </div>
        );
    };


    const renderFiles = () => {
        if (!modalData) return <div>در حال بارگذاری...</div>;

        const files = [
            modalData?.file_1
                ? {
                    uid: "-1",
                    name: "فایل غیرقابل ویرایش",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_1,
                }
                : null,
            modalData?.file_2
                ? {
                    uid: "-2",
                    name: "قابل ویرایش",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_2,
                }
                : null,
            modalData?.file_3
                ? {
                    uid: "-3",
                    name: "فایل پشتیبان تولید",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_3,
                }
                : null,
            modalData?.file_4
                ? {
                    uid: "-4",
                    name: "ارسال به کارفرما/پیمانکار",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_4,
                }
                : null,
        ].filter(Boolean);

        if (!files.length) return <div>فایلی موجود نیست</div>;

        return (
            <Row gutter={[8, 8]} className={"flex justify-evenly border border-blue-500 rounded p-5"}>
                {files.map((file) => (
                    <Col key={file.uid}>
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{display: "flex", alignItems: "center", gap: 4}}
                        >
                            <FileOutlined/> {file.name}
                        </a>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <Modal size={900} isOpen={isOpen} title={"روال اسناد"} onClose={closeModal} footer={true}>
            <Form>
                <Row gutter={[16, 16]}>
                    <Col span={24}>{renderFiles()}</Col>
                    <Col span={24}>
                        <Steps
                            size="small"
                            current={currentStepIndex}
                            items={stateSteps.map((step) => ({
                                title: <CustomStep title={step.label} log={step.log} logs={step.logs}/>,
                            }))}
                        />
                    </Col>
                    <Col span={24}>
                        <Form.Item label="توضیح" layout={'vertical'}>
                            <Input.TextArea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="توضیح مربوط به این مرحله را وارد کنید"
                                disabled={isPatching}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24} className={"w-full flex flex-row justify-end gap-4 mt-6"}>
                        <Button
                            onClick={handlePrevStep}
                            disabled={!comment || currentStepIndex <= 0 || isPatching}
                            loading={isPatching}
                        >
                            {currentState === 20 ? 'برگشت به تهیه نشده' :
                                currentState === 30 ? 'برگشت به تهیه کننده' :
                                    currentState === 40 ? 'برگشت به تایید' :
                                        'تصویب شده است'}
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleNextStep}
                            disabled={!comment || currentStepIndex >= stateSteps.length - 1 || isPatching}
                            loading={isPatching}
                        >
                            {currentState === 20 ? 'تایید' :
                                currentState === 30 ? 'تصویب' :

                                    'تایید نهایی'}
                        </Button>
                    </Col>
                </Row>

                <AntModal title="جزئیات تغییر وضعیت" open={detailModalVisible}
                          onCancel={() => setDetailModalVisible(false)} footer={null}>
                    {selectedLog && (
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="کاربر">
                                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                                    <Avatar
                                        size="default"
                                        icon={<UserOutlined/>}
                                        src={selectedLog.changed_by?.signature_image || selectedLog.changed_by?.temp_image}
                                    />
                                    <span>
                    {selectedLog.changed_by?.name} {selectedLog.changed_by?.last_name}
                  </span>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="از مرحله">
                                {stateSteps.find((s) => s.value === selectedLog.from_state)?.label || selectedLog.from_state}
                            </Descriptions.Item>
                            <Descriptions.Item label="به مرحله">
                                {stateSteps.find((s) => s.value === selectedLog.to_state)?.label || selectedLog.to_state}
                            </Descriptions.Item>
                            <Descriptions.Item label="تاریخ تغییر">
                                {new Date(selectedLog.changed_at).toLocaleString("fa-IR")}
                            </Descriptions.Item>
                            <Descriptions.Item label="توضیحات">{selectedLog.comment || "بدون توضیح"}</Descriptions.Item>
                        </Descriptions>
                    )}
                </AntModal>
            </Form>
        </Modal>
    );
};

export default AutomationFileModal;

