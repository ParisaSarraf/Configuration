import Modal from "@/components/Modal/index.jsx";
import {Avatar, Button, Col, Form, Input, message, Popover, Row, Steps, Table} from "antd";
import {useEffect, useState} from "react";
import {FileOutlined, UserOutlined} from "@ant-design/icons";
import {usePatchDocumentEditionLog} from "@/QueryServises/productDocumentEditionLogQuery";
import {useLogList} from "@/QueryServises/LogQuery/index.js";
import {BASEURL} from "@/Services/axiosInstance.js";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";


const useAllLogs = (id) => {
    const states = [10, 20, 30, 40];

    const results = states?.map((state) =>
        useLogList({id, model: "product_document_edition", state})
    );
    const data = results.flatMap((r) => r.data || []);

    const isLoading = results.some((r) => r.isLoading);

    return {data, isLoading};
};

const AutomationFileModal = ({isOpen, modalData, closeModal}) => {
    const [currentState, setCurrentState] = useState(null);
    const [comment, setComment] = useState("");

    const {mutateAsync: updateState, isPending: isPatching} = usePatchDocumentEditionLog();

    const stateSteps = [
        {value: 10, label: "تعریف سند"},
        {value: 20, label: "تهیه شده"},
        {value: 30, label: "تایید شده"},
        {value: 40, label: "تصویب شده"},
    ];

    const currentStepIndex = stateSteps?.findIndex((s) => s.value === currentState);

    const {data: logList = []} = useAllLogs(modalData?.id);

    useEffect(() => {
        if (modalData?.state) {
            setCurrentState(modalData.state);
        }
    }, [modalData]);

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
            message.success(`به مرحله "${stateSteps?.find((s) => s.value === prevState).label}" منتقل شد`);
            setCurrentState(prevState);
            setComment("");
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.detail || "خطا در بازگردانی مرحله");
        }
    };

    const renderFiles = () => {
        if (!modalData) return <div>در حال بارگذاری...</div>;

        const files = [
            modalData?.file_1
                ? {uid: "-1", name: "فایل غیرقابل ویرایش", url: BASEURL.replace("/api/v1", "") + modalData.file_1}
                : null,
            modalData?.file_2
                ? {uid: "-2", name: "قابل ویرایش", url: BASEURL.replace("/api/v1", "") + modalData.file_2}
                : null,
            modalData?.file_3
                ? {uid: "-3", name: "فایل پشتیبان تولید", url: BASEURL.replace("/api/v1", "") + modalData.file_3}
                : null,
            modalData?.file_4
                ? {uid: "-4", name: "ارسال به کارفرما/پیمانکار", url: BASEURL.replace("/api/v1", "") + modalData.file_4}
                : null,
        ].filter(Boolean);

        if (!files.length) return <div>فایلی موجود نیست</div>;

        return (
            <Row gutter={[8, 8]} className={"flex justify-evenly border border-blue-500 rounded p-5"}>
                {files.map((file) => (
                    <Col key={file.uid}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer"
                           style={{display: "flex", alignItems: "center", gap: 4}}>
                            <FileOutlined/> {file.name}
                        </a>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <Modal size={1000} isOpen={isOpen} title={"روال اسناد"} onClose={closeModal} footer={true}>
            <Form>
                <Row gutter={[16, 16]}>
                    <Col span={24}>{renderFiles()}</Col>

                    <Col span={24}>
                        <Steps
                            size="small"
                            current={currentStepIndex}
                            items={stateSteps.map((step) => {
                                const stepLogs = logList?.filter((l) => l.to_state === step.value);
                                const lastLog = stepLogs?.length > 0 ? stepLogs[stepLogs.length - 1] : null;

                                return {
                                    title: (
                                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                            <span>{step.label}</span>

                                            {lastLog && (
                                                <Popover
                                                    trigger="click"
                                                    placement="bottom"
                                                    title={`تاریخچه (${step.label})`}
                                                    content={
                                                        <div style={{maxHeight: 300, overflowY: "auto", width: 650}}>
                                                            <Table
                                                                dataSource={stepLogs}
                                                                rowKey="id"
                                                                columns={[
                                                                    {
                                                                        title: "کاربر",
                                                                        key: "user",
                                                                        render: (_, record) => (
                                                                            <div style={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "8px",
                                                                            }}>
                                                                                <Avatar
                                                                                    size="small"
                                                                                    icon={<UserOutlined/>}
                                                                                    src={record.changed_by?.signature_image || record.changed_by?.temp_image}
                                                                                />
                                                                                <span>
                                                                                    {record.changed_by?.name}{" "}
                                                                                    {record.changed_by?.last_name}
                                                                                </span>
                                                                            </div>
                                                                        ),
                                                                    },
                                                                    {
                                                                        title: "از مرحله",
                                                                        dataIndex: "from_state",
                                                                        render: (v) =>
                                                                            stateSteps?.find((s) => s.value === v)?.label ||
                                                                            v,
                                                                    },
                                                                    {
                                                                        title: "به مرحله",
                                                                        dataIndex: "to_state",
                                                                        render: (v) =>
                                                                            stateSteps?.find((s) => s.value === v)?.label ||
                                                                            v,
                                                                    },
                                                                    {
                                                                        title: "تاریخ تغییر",
                                                                        dataIndex: "changed_at",
                                                                        render: (record) => (
                                                                            <>{georgianDateToJalaliDate(record)}</>
                                                                        ),
                                                                    },
                                                                    {
                                                                        title: "توضیحات",
                                                                        dataIndex: "comment",
                                                                        render: (v) => v || "بدون توضیح",
                                                                    },
                                                                ]}
                                                                pagination={false}
                                                                size="small"
                                                                bordered
                                                            />
                                                        </div>
                                                    }
                                                >
                                                    <Button type="link" size="small" style={{marginTop: 4}}>
                                                        👤 {lastLog.changed_by?.name} {lastLog.changed_by?.last_name}
                                                    </Button>
                                                </Popover>
                                            )}
                                        </div>
                                    ),
                                };
                            })}
                        />
                    </Col>

                    <Col span={24}>
                        <Form.Item label="توضیح" layout={"vertical"}>
                            <Input.TextArea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="توضیح مربوط به این مرحله را وارد کنید"
                                disabled={isPatching}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24} className={"w-full flex flex-row justify-end gap-4 mt-6"}>
                        {currentState === 10 && (
                            <Button
                                onClick={handlePrevStep}
                                disabled={!comment || currentStepIndex <= 0 || isPatching}
                                loading={isPatching}
                            >
                                {
                                    currentState === 20
                                        ? "رد تهیه"
                                        : currentState === 30
                                            ? "رد تایید"
                                            : currentState === 40
                                                ? "رد تصویب"
                                                : "تصویب شده است"
                                }
                            </Button>
                        )}
                        {!currentState === 40 && (<Button
                            type="primary"
                            onClick={handleNextStep}
                            disabled={!comment || currentStepIndex >= stateSteps?.length - 1 || isPatching}
                            loading={isPatching}
                        >
                            {
                                currentState === 10 ? "تهیه"
                                    : currentState === 20
                                        ? "تایید"
                                        : currentState === 30
                                            ? "تصویب"
                                            : "تایید نهایی"}
                        </Button>)}
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AutomationFileModal;
