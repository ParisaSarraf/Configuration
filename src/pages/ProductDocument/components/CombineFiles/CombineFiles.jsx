import Modal from "@/components/Modal/index.jsx";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Select,
  Popover,
  Row,
  Steps,
  Table,
} from "antd";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import { FileOutlined, UserOutlined } from "@ant-design/icons";
import { useUpdateProductDocumentEdition } from "@/QueryServises/productDocumentQuery/index.js";
import { usePatchDocumentEditionLog } from "@/QueryServises/productDocumentEditionLogQuery";
import { useEffect, useState } from "react";
import { BASEURL } from "@/Services/axiosInstance.js";
import {
  addMonthsToCurrentGregorianDate,
  georgianDateToJalaliDate,
} from "@utils/timeTool.jsx";
import { useAllLogs } from "@/hooks/useAllLogs.js";
import { canViewDocumentFiles } from "@/utils/ExportFromToken.js";

const CombineFiles = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  refetch,
  modalType,
  currentProduct,
}) => {
  const [form] = Form.useForm();
  const [currentState, setCurrentState] = useState(null);
  const [comment, setComment] = useState("");
  const [reviewPeriod, setReviewPeriod] = useState(null);
  const [surveyDate, setSurveyDate] = useState(null);

  const editionRecord =
    modalType === "SpecificAutomationFiles"
      ? modalData?.editions?.[0]
      : modalData;
  const editionId = editionRecord?.id;
  const productDocumentId =
    editionRecord?.product_document_id?.id ??
    editionRecord?.product_document_id ??
    modalData?.product_document_id?.id ??
    modalData?.product_document_id ??
    (modalType === "SpecificAutomationFiles" ? modalData?.id : undefined);
  const { isPending: isUpdating, mutateAsync: updateProductDocumentEdition } =
    useUpdateProductDocumentEdition();

  const { mutateAsync: updateState, isPending: isPatching } =
    usePatchDocumentEditionLog();

  const { data: logList = [] } = useAllLogs(editionId);

  const currentSurveyDate = surveyDate;

  const stateSteps = [
    { value: 10, label: "تعریف سند" },
    { value: 20, label: "تهیه شده" },
    { value: 30, label: "تایید شده" },
    { value: 40, label: "تصویب شده" },
  ];

  const currentStepIndex = stateSteps?.findIndex(
    (s) => s.value === currentState,
  );

  useEffect(() => {
    const editionState =
      modalType === "SpecificAutomationFiles"
        ? modalData?.editions?.[0]?.state
        : modalData?.state;
    setCurrentState(editionState == null ? null : Number(editionState));
    setSurveyDate(
      modalType === "SpecificAutomationFiles"
        ? modalData?.editions?.[0]?.survey_date ||
            modalData?.survey_date ||
            null
        : modalData?.survey_date || null,
    );
    setReviewPeriod(null);
    setComment("");
  }, [modalData, modalType]);

  useEffect(() => {
    if (modalData) {
      const fileSource =
        modalType === "SpecificAutomationFiles"
          ? modalData?.editions?.[0] || {}
          : modalData;
      form.setFieldsValue({
        edition:
          modalType === "SpecificAutomationFiles"
            ? modalData?.editions?.[0]?.edition
            : modalData?.edition,
        is_active: modalData?.is_active,
        file_1: fileSource.file_1
          ? [
              {
                uid: "-1",
                name: "file_1",
                url: BASEURL.replace("/api/v1", "") + fileSource.file_1,
              },
            ]
          : [],
        file_2: fileSource.file_2
          ? [
              {
                uid: "-1",
                name: "file_2",
                url: BASEURL.replace("/api/v1", "") + fileSource.file_2,
              },
            ]
          : [],
        file_3: fileSource.file_3
          ? [
              {
                uid: "-1",
                name: "file_3",
                url: BASEURL.replace("/api/v1", "") + fileSource.file_3,
              },
            ]
          : [],
        file_4: fileSource.file_4
          ? [
              {
                uid: "-1",
                name: "file_4",
                url: BASEURL.replace("/api/v1", "") + fileSource.file_4,
              },
            ]
          : [],
        description: fileSource?.description,
        is_combined: true,
      });
    } else {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = async (values) => {
    const fileSource =
      modalType === "SpecificAutomationFiles"
        ? modalData?.editions?.[0] || {}
        : modalData;

    const payload = {
      product_document_id: productDocumentId,
      edition: values.edition,
      file_1: values.file_1?.[0]?.originFileObj,
      file_2: values.file_2?.[0]?.originFileObj,
      file_3: values.file_3?.[0]?.originFileObj,
      file_4: values.file_4?.[0]?.originFileObj,
      description: values.description,
      reasons_editing_id:
        fileSource.reasons_editing?.id ??
        fileSource.reasons_editing_id ??
        (typeof fileSource.reasons_editing === "number"
          ? fileSource.reasons_editing
          : undefined),
      is_active: fileSource.is_active ?? true,
      state: currentState,
      survey_date: currentSurveyDate,
    };

    try {
      await updateProductDocumentEdition({
        documentId: editionId,
        ...payload,
      });
      message.success("نسخه با موفقیت ویرایش شد");
      await refetch();
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.detail ||
        "عملیات موفقیت آمیز نبود، دوباره امتحان کنید";
      message.error(errorMessage);
    }
  };

  const handleNextStep = async () => {
    if (currentStepIndex >= stateSteps?.length - 1) return;
    const nextState = stateSteps[currentStepIndex + 1].value;
    const shouldSetSurveyDate = currentState === 20 && nextState === 30;
    const nextSurveyDate = shouldSetSurveyDate
      ? addMonthsToCurrentGregorianDate(reviewPeriod)
      : undefined;

    if (shouldSetSurveyDate && !reviewPeriod) {
      message.warning("لطفاً بازه بازبینی سند را انتخاب کنید");
      return;
    }

    try {
      if (shouldSetSurveyDate) {
        const fileSource =
          modalType === "SpecificAutomationFiles"
            ? modalData?.editions?.[0] || {}
            : modalData;
        await updateProductDocumentEdition({
          documentId: editionId,
          product_document_id: productDocumentId,
          edition: fileSource.edition,
          description: fileSource.description,
          reasons_editing_id:
            fileSource.reasons_editing?.id ?? fileSource.reasons_editing_id,
          is_active: fileSource.is_active ?? true,
          state: nextState,
          survey_date: nextSurveyDate,
        });
      }

      await updateState({
        id: editionId,
        state: nextState,
        comment: comment,
      });
      message.success("مرحله با موفقیت بروزرسانی شد");
      setCurrentState(nextState);
      if (nextSurveyDate) setSurveyDate(nextSurveyDate);
      await refetch();
      setComment("");
      setReviewPeriod(null);
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
        id: editionId,
        state: prevState,
        comment: comment,
      });
      message.success(
        `به مرحله "${
          stateSteps?.find((s) => s.value === prevState).label
        }" منتقل شد`,
      );
      setCurrentState(prevState);
      await refetch();
      setComment("");
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.detail || "خطا در بازگردانی مرحله");
    }
  };

  const renderFiles = () => {
    if (!modalData) return <div>در حال بارگذاری...</div>;

    const fileSource = editionRecord || {};

    if (!canViewDocumentFiles(currentState, undefined, currentSurveyDate)) {
      return <div>شما اجازه مشاهده این فایل‌ها را ندارید</div>;
    }

    const files = [
      fileSource?.file_1
        ? {
            uid: "-1",
            name: "فایل غیرقابل ویرایش",
            url: BASEURL.replace("/api/v1", "") + fileSource.file_1,
          }
        : null,
      fileSource?.file_2
        ? {
            uid: "-2",
            name: "قابل ویرایش",
            url: BASEURL.replace("/api/v1", "") + fileSource.file_2,
          }
        : null,
      fileSource?.file_3
        ? {
            uid: "-3",
            name: "فایل پشتیبان تولید",
            url: BASEURL.replace("/api/v1", "") + fileSource.file_3,
          }
        : null,
      fileSource?.file_4
        ? {
            uid: "-4",
            name: "ارسال به کارفرما/پیمانکار",
            url: BASEURL.replace("/api/v1", "") + fileSource.file_4,
          }
        : null,
    ].filter(Boolean);

    if (!files.length) return <div>فایلی موجود نیست</div>;

    return (
      <Row
        gutter={[8, 8]}
        className={"flex justify-evenly border border-blue-500 rounded p-5"}
      >
        {files.map((file) => (
          <Col key={file.uid}>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <FileOutlined /> {file.name}
            </a>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`${
        modalMode === "edit"
          ? "ویرایش روال اسناد و فایل های"
          : "افزودن روال اسناد و فایل های "
      } ${currentProduct.name}`}
      size={1000}
      onClose={closeModal}
      onSubmit={() => form.submit()}
      mode={modalMode}
      footer
      className="scroll-modal"
      destroyOnClose
      loading={isUpdating || isPatching}
    >
      <Form form={form} layout="vertical" onFinish={onFinishForm}>
        <Card title="مدیریت فایل‌ها" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label={"فایل غیرقابل ویرایش"} name="file_1">
                <FileUploader
                  maxCount={1}
                  documentState={currentState}
                  surveyDate={currentSurveyDate}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={"قابل ویرایش"} name="file_2">
                <FileUploader
                  maxCount={1}
                  documentState={currentState}
                  surveyDate={currentSurveyDate}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={"فایل پشتیبان تولید"} name="file_3">
                <FileUploader
                  maxCount={1}
                  documentState={currentState}
                  surveyDate={currentSurveyDate}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={"ارسال به کارفرما/پیمانکار"} name="file_4">
                <FileUploader
                  maxCount={1}
                  documentState={currentState}
                  surveyDate={currentSurveyDate}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button onClick={closeModal}>انصراف</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isUpdating}
              disabled={isUpdating}
            >
              {isUpdating ? "در حال ذخیره..." : "ذخیره فایل‌ها"}
            </Button>
          </div>
        </Card>

        <Card title="روال اسناد">
          <Row gutter={[16, 16]}>
            <Col span={24}>{renderFiles()}</Col>
            <Col span={24}>
              <Steps
                size="small"
                current={currentStepIndex}
                items={stateSteps.map((step) => {
                  const stepLogs = logList?.filter(
                    (l) => l.to_state === step.value,
                  );
                  const lastLog =
                    stepLogs?.length > 0 ? stepLogs[stepLogs.length - 1] : null;

                  return {
                    title: (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span>{step.label}</span>

                        {lastLog && (
                          <Popover
                            trigger="click"
                            placement="bottom"
                            title={`تاریخچه (${step.label})`}
                            content={
                              <div
                                style={{
                                  maxHeight: 300,
                                  overflowY: "auto",
                                  width: 650,
                                }}
                              >
                                <Table
                                  dataSource={stepLogs}
                                  rowKey="id"
                                  columns={[
                                    {
                                      title: "کاربر",
                                      key: "user",
                                      render: (_, record) => (
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                          }}
                                        >
                                          <Avatar
                                            size="small"
                                            icon={<UserOutlined />}
                                            src={
                                              record.changed_by
                                                ?.signature_image ||
                                              record.changed_by?.temp_image
                                            }
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
                                        stateSteps?.find((s) => s.value === v)
                                          ?.label || v,
                                    },
                                    {
                                      title: "به مرحله",
                                      dataIndex: "to_state",
                                      render: (v) =>
                                        stateSteps?.find((s) => s.value === v)
                                          ?.label || v,
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
                            <Button
                              type="link"
                              size="small"
                              style={{ marginTop: 4 }}
                            >
                              👤 {lastLog.changed_by?.name}{" "}
                              {lastLog.changed_by?.last_name}
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
              {currentState === 20 && (
                <Form.Item
                  label="بازه بازبینی"
                  required
                  validateStatus={!reviewPeriod ? "warning" : undefined}
                  help={
                    !reviewPeriod
                      ? "برای رفتن از مرحله تهیه به تایید، بازه بازبینی را انتخاب کنید"
                      : undefined
                  }
                >
                  <Select
                    value={reviewPeriod}
                    onChange={setReviewPeriod}
                    placeholder="انتخاب بازه بازبینی"
                    options={[
                      { value: 1, label: "۱ ماه" },
                      { value: 3, label: "۳ ماه" },
                      { value: 6, label: "۶ ماه" },
                      { value: 12, label: "۱۲ ماه" },
                    ]}
                    disabled={isPatching || isUpdating}
                  />
                </Form.Item>
              )}
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

            <Col
              span={24}
              className={"w-full flex flex-row justify-end gap-4 mt-6"}
            >
              <Button
                onClick={handlePrevStep}
                disabled={!comment || currentStepIndex <= 0 || isPatching}
                loading={isPatching}
              >
                {currentState === 20
                  ? "رد تهیه"
                  : currentState === 30
                    ? "رد تایید"
                    : currentState === 40
                      ? "رد تصویب"
                      : "تصویب شده است"}
              </Button>

              <Button
                type="primary"
                onClick={handleNextStep}
                disabled={
                  !comment ||
                  (currentState === 20 && !reviewPeriod) ||
                  currentStepIndex >= stateSteps?.length - 1 ||
                  isPatching ||
                  isUpdating
                }
                loading={isPatching}
              >
                {currentState === 10
                  ? "تهیه"
                  : currentState === 20
                    ? "تایید"
                    : currentState === 30
                      ? "تصویب"
                      : "تایید نهایی"}
              </Button>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default CombineFiles;
