import Modal from "@/components/Modal/index.jsx";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
} from "antd";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import { FileOutlined } from "@ant-design/icons";
import { useUpdateProductDocumentEdition } from "@/QueryServises/productDocumentQuery/index.js";
import { usePatchDocumentEditionLog } from "@/QueryServises/productDocumentEditionLogQuery";
import { useEffect, useMemo, useState } from "react";
import { BASEURL } from "@/Services/axiosInstance.js";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";
import { useAllLogs } from "@/hooks/useAllLogs.js";
import { canViewDocumentFiles } from "@/utils/ExportFromToken.js";

const DocumentWorkflowGraph = ({ steps, currentState, logs }) => {
  const width = 780;
  const height = 235;
  const nodeWidth = 126;
  const nodeHeight = 58;
  const nodeY = 104;
  const startX = 700;
  const spacing = 195;
  const point = (index) => startX - index * spacing;

  const indexByValue = new Map(
    steps.map((step, index) => [Number(step.value), index]),
  );

  const routeOccurrences = new Map();
  const routes = logs
    .map((log) => {
      const fromIndex = indexByValue.get(Number(log.from_state));
      const toIndex = indexByValue.get(Number(log.to_state));
      if (fromIndex == null || toIndex == null || fromIndex === toIndex)
        return null;

      const isReturn = toIndex < fromIndex;
      const key = `${fromIndex}-${toIndex}`;
      const occurrence = routeOccurrences.get(key) ?? 0;
      routeOccurrences.set(key, occurrence + 1);

      const sourceX = point(fromIndex);
      const targetX = point(toIndex);
      const direction = targetX > sourceX ? 1 : -1;
      const start = sourceX + direction * (nodeWidth / 2 + 4);
      const end = targetX - direction * (nodeWidth / 2 + 7);
      const mid = (start + end) / 2;
      const bend = 34 + occurrence * 13;
      const controlY = isReturn ? nodeY + bend + 48 : nodeY - bend;

      return {
        ...log,
        isReturn,
        path: `M ${start} ${nodeY} Q ${mid} ${controlY} ${end} ${nodeY}`,
        labelX: mid,
        labelY: isReturn ? nodeY + bend / 2 + 30 : nodeY - bend / 2 - 5,
      };
    })
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">
            نمودار گردش سند
          </div>
          <div className="text-[10px] text-slate-400">
            نام کاربر و زمان انجام هر تغییر روی مسیر نمایش داده می‌شود
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-blue-600">
            <span className="h-0.5 w-5 bg-blue-500" /> رفت
          </span>
          <span className="flex items-center gap-1 text-orange-600">
            <span className="h-0.5 w-5 bg-orange-500" /> برگشت
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="h-0.5 w-5 bg-slate-300" /> مسیر تعریف‌شده
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[235px] min-w-[720px] w-full"
          role="img"
          aria-label="نمودار رفت و برگشت مراحل سند"
          dir="ltr"
        >
          <defs>
            <marker
              id="document-flow-base-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
            </marker>
            <marker
              id="document-flow-forward-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
            </marker>
            <marker
              id="document-flow-return-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
            </marker>
            <filter id="document-current-shadow" x="-30%" y="-40%" width="160%" height="180%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* مسیر پایه‌ی تعریف‌شده بین مراحل */}
          {steps.slice(0, -1).map((step, index) => {
            const start = point(index) - nodeWidth / 2 - 5;
            const end = point(index + 1) + nodeWidth / 2 + 8;
            return (
              <path
                key={`base-${step.value}`}
                d={`M ${start} ${nodeY} L ${end} ${nodeY}`}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="5 5"
                markerEnd="url(#document-flow-base-arrow)"
              />
            );
          })}

          {/* رفت‌وبرگشت‌های واقعی مستقیماً روی نمودار */}
          {routes.map((route, index) => {
            const color = route.isReturn ? "#ea580c" : "#2563eb";
            const fromLabel =
              steps[indexByValue.get(Number(route.from_state))]?.label ||
              route.from_state;
            const toLabel =
              steps[indexByValue.get(Number(route.to_state))]?.label ||
              route.to_state;
            const person =
              [route.changed_by?.name, route.changed_by?.last_name]
                .filter(Boolean)
                .join(" ") ||
              route.changed_by?.username ||
              "کاربر نامشخص";
            const userImagePath =
              route.changed_by?.signature_image || route.changed_by?.temp_image;
            const userImage = userImagePath
              ? /^(https?:|data:|blob:)/i.test(userImagePath)
                ? userImagePath
                : `${BASEURL.replace("/api/v1", "")}${
                    userImagePath.startsWith("/") ? "" : "/"
                  }${userImagePath}`
              : null;
            const actionTime = route.changed_at
              ? georgianDateTimeToJalaliDateTime(route.changed_at)
              : "زمان نامشخص";
            const userExtra =
              route.changed_by?.role?.name ||
              route.changed_by?.username ||
              route.changed_by?.email;
            const detail = [
              `از ${fromLabel} به ${toLabel}`,
              person,
              userExtra || null,
              actionTime,
              route.comment || null,
            ]
              .filter(Boolean)
              .join(" | ");

            return (
              <g key={route.id ?? `${route.changed_at}-${index}`}>
                <path
                  d={route.path}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd={
                    route.isReturn
                      ? "url(#document-flow-return-arrow)"
                      : "url(#document-flow-forward-arrow)"
                  }
                >
                  <title>{detail}</title>
                </path>
                <foreignObject
                  x={route.labelX - 66}
                  y={route.labelY - 20}
                  width="132"
                  height="42"
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    title={detail}
                    dir="rtl"
                    className={`flex h-10 w-[130px] items-center gap-1.5 rounded-lg border bg-white/95 px-1.5 shadow-sm ${
                      route.isReturn
                        ? "border-orange-300"
                        : "border-blue-300"
                    }`}
                  >
                    <div className="relative h-7 w-7 shrink-0">
                      {userImage ? (
                        <img
                          src={userImage}
                          alt={person}
                          className="h-7 w-7 rounded-full border border-white object-cover shadow"
                        />
                      ) : (
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                            route.isReturn ? "bg-orange-500" : "bg-blue-600"
                          }`}
                        >
                          {person.slice(0, 1)}
                        </span>
                      )}
                      <span
                        className={`absolute -bottom-1 -left-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-bold text-white ${
                          route.isReturn ? "bg-orange-600" : "bg-blue-700"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[9px] font-bold text-slate-700">
                        {person}
                      </div>
                      <div className="mt-0.5 truncate text-[8px] text-slate-500">
                        {actionTime}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* گره‌های مراحل */}
          {steps.map((step, index) => {
            const x = point(index);
            const isCurrent = Number(step.value) === Number(currentState);
            return (
              <g key={step.value}>
                <rect
                  x={x - nodeWidth / 2}
                  y={nodeY - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx="13"
                  fill={isCurrent ? "#eff6ff" : "#ffffff"}
                  stroke={isCurrent ? "#2563eb" : "#cbd5e1"}
                  strokeWidth={isCurrent ? "2.5" : "1.5"}
                  filter={isCurrent ? "url(#document-current-shadow)" : undefined}
                />
                <circle
                  cx={x}
                  cy={nodeY - nodeHeight / 2}
                  r={isCurrent ? "7" : "5"}
                  fill={isCurrent ? "#2563eb" : "#94a3b8"}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={nodeY - 2}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill={isCurrent ? "#1d4ed8" : "#334155"}
                  direction="rtl"
                >
                  {step.label}
                </text>
                <text
                  x={x}
                  y={nodeY + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isCurrent ? "#2563eb" : "#94a3b8"}
                  direction="rtl"
                >
                  {isCurrent
                    ? "وضعیت فعلی"
                    : `مرحله ${(index + 1).toLocaleString("fa-IR")}`}
                </text>
              </g>
            );
          })}

          {!routes.length ? (
            <text
              x={width / 2}
              y="207"
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
              direction="rtl"
            >
              هنوز رفت‌وبرگشتی برای این سند ثبت نشده است
            </text>
          ) : null}
        </svg>
      </div>
    </div>
  );
};

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

  const ProductDocumentId = modalData?.editions?.[0]?.id;
  const { isPending: isUpdating, mutateAsync: updateProductDocumentEdition } =
    useUpdateProductDocumentEdition();

  const { mutateAsync: updateState, isPending: isPatching } =
    usePatchDocumentEditionLog();

  const editionId =
    modalType === "SpecificAutomationFiles"
      ? modalData?.editions?.[0]?.id
      : modalData?.id;
  const { data: logList = [], refetch: refetchLogs } = useAllLogs(editionId);

  const stateSteps = [
    { value: 10, label: "تعریف سند" },
    { value: 20, label: "تهیه شده" },
    { value: 30, label: "تایید شده" },
    { value: 40, label: "تصویب شده" },
  ];

  const currentStepIndex = stateSteps?.findIndex(
    (s) => s.value === currentState,
  );

  // لاگ‌ها از چهار درخواست جداگانه می‌آیند؛ اینجا مرتب و یکتا می‌شوند تا
  // مسیر واقعی رفت‌وبرگشت سند به ترتیب زمان نمایش داده شود.
  const orderedLogs = useMemo(() => {
    const seen = new Set();
    return [...(Array.isArray(logList) ? logList : [])]
      .filter((log) => {
        if (!log) return false;
        const key =
          log.id ??
          `${log.from_state}-${log.to_state}-${log.changed_at}-${log.comment ?? ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const aTime = new Date(a.changed_at || 0).getTime();
        const bTime = new Date(b.changed_at || 0).getTime();
        return aTime - bTime;
      });
  }, [logList]);

  useEffect(() => {
    const editionState = modalType === "SpecificAutomationFiles"
      ? modalData?.editions?.[0]?.state
      : modalData?.state;
    setCurrentState(editionState == null ? null : Number(editionState));
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
      product_document_id:
        modalType === "SpecificAutomationFiles"
          ? ProductDocumentId
          : modalData?.product_document_id?.id,
      edition: values.edition,
      file_1: values.file_1?.[0]?.originFileObj,
      file_2: values.file_2?.[0]?.originFileObj,
      file_3: values.file_3?.[0]?.originFileObj,
      file_4: values.file_4?.[0]?.originFileObj,
      description: values.description,
      is_active: fileSource.is_active ?? true,
    };

    try {
      await updateProductDocumentEdition({
        documentId:
          modalType === "SpecificAutomationFiles"
            ? ProductDocumentId
            : modalData?.id,
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

    try {
      await updateState({
        id:
          modalType === "SpecificAutomationFiles"
            ? ProductDocumentId
            : modalData?.id,
        state: nextState,
        comment: comment,
      });
      message.success("مرحله با موفقیت بروزرسانی شد");
      setCurrentState(nextState);
      setComment("");
      await refetchLogs();
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
        id:
          modalType === "SpecificAutomationFiles"
            ? ProductDocumentId
            : modalData?.id,
        state: prevState,
        comment: comment,
      });
      message.success(
        `به مرحله "${
          stateSteps?.find((s) => s.value === prevState).label
        }" منتقل شد`,
      );
      setCurrentState(prevState);
      setComment("");
      await refetchLogs();
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.detail || "خطا در بازگردانی مرحله");
    }
  };

  const renderFiles = () => {
    if (!modalData) return <div>در حال بارگذاری...</div>;

    if (!canViewDocumentFiles(currentState)) {
      return <div>شما اجازه مشاهده این فایل‌ها را ندارید</div>;
    }

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
                <FileUploader maxCount={1} documentState={currentState} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={"قابل ویرایش"} name="file_2">
                <FileUploader maxCount={1} documentState={currentState} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={"فایل پشتیبان تولید"} name="file_3">
                <FileUploader maxCount={1} documentState={currentState} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={"ارسال به کارفرما/پیمانکار"} name="file_4">
                <FileUploader maxCount={1} documentState={currentState} />
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
              <DocumentWorkflowGraph
                steps={stateSteps}
                currentState={currentState}
                logs={orderedLogs}
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
                  currentStepIndex >= stateSteps?.length - 1 ||
                  isPatching
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
