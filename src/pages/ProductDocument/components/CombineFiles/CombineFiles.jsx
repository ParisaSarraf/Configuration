import Modal from "@/components/Modal/index.jsx";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Popover,
  Row,
  Select,
} from "antd";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import { FileOutlined } from "@ant-design/icons";
import { useUpdateProductDocumentEdition } from "@/QueryServises/productDocumentQuery/index.js";
import { usePatchDocumentEditionLog } from "@/QueryServises/productDocumentEditionLogQuery";
import { useEffect, useMemo, useState } from "react";
import { BASEURL } from "@/Services/axiosInstance.js";
import {
  addMonthsToCurrentGregorianDate,
  georgianDateTimeToJalaliDateTime,
} from "@utils/timeTool.jsx";
import { useAllLogs } from "@/hooks/useAllLogs.js";
import { canViewDocumentFiles } from "@/utils/ExportFromToken.js";

const getWorkflowUserName = (user) =>
  [user?.name, user?.last_name].filter(Boolean).join(" ") ||
  user?.username ||
  "کاربر نامشخص";

const getWorkflowUserImage = (user) => {
  const path = user?.signature_image || user?.temp_image;
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${BASEURL.replace("/api/v1", "")}${path.startsWith("/") ? "" : "/"}${path}`;
};

const WorkflowUserAvatar = ({ user, tone = "blue", size = "small" }) => {
  const name = getWorkflowUserName(user);
  const image = getWorkflowUserImage(user);
  const dimension = size === "large" ? "h-8 w-8" : "h-6 w-6";
  return image ? (
    <img
      src={image}
      alt={name}
      className={`${dimension} shrink-0 rounded-full border-2 border-white object-cover shadow-sm`}
    />
  ) : (
    <span
      className={`flex ${dimension} shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
        tone === "orange" ? "bg-orange-500" : "bg-blue-600"
      }`}
    >
      {name.slice(0, 1)}
    </span>
  );
};

const DocumentWorkflowGraph = ({ steps, currentState, logs }) => {
  const width = 780;
  const height = 220;
  const nodeWidth = 120;
  const nodeHeight = 56;
  const nodeY = 120;
  const startX = 700;
  const spacing = 195;
  const point = (index) => startX - index * spacing;

  const indexByValue = new Map(
    steps.map((step, index) => [Number(step.value), index]),
  );

  // رفت‌وبرگشت‌های تکراری بین یک مبدأ و مقصد در یک مسیر تجمیع می‌شوند؛
  // به‌جای چند خط روی هم، فقط آخرین کاربر و تعداد تغییرها دیده می‌شود.
  const groupedRoutes = new Map();
  logs.forEach((log) => {
    const fromIndex = indexByValue.get(Number(log.from_state));
    const toIndex = indexByValue.get(Number(log.to_state));
    if (fromIndex == null || toIndex == null || fromIndex === toIndex) return;
    const key = `${fromIndex}-${toIndex}`;
    if (!groupedRoutes.has(key)) {
      groupedRoutes.set(key, {
        key,
        fromIndex,
        toIndex,
        isReturn: toIndex < fromIndex,
        items: [],
      });
    }
    groupedRoutes.get(key).items.push(log);
  });

  const routes = Array.from(groupedRoutes.values()).map((route) => {
    const items = [...route.items].sort(
      (a, b) =>
        new Date(a.changed_at || 0).getTime() -
        new Date(b.changed_at || 0).getTime(),
    );
    const sourceX = point(route.fromIndex);
    const targetX = point(route.toIndex);
    const direction = targetX > sourceX ? 1 : -1;
    const start = sourceX + direction * (nodeWidth / 2 + 5);
    const end = targetX - direction * (nodeWidth / 2 + 8);
    const middle = (start + end) / 2;
    const distance = Math.abs(route.toIndex - route.fromIndex);
    const curve = 82 + Math.max(0, distance - 1) * 14;
    const controlY = route.isReturn ? nodeY + curve : nodeY - curve;
    const labelY = (nodeY + controlY) / 2;

    return {
      ...route,
      items,
      latest: items[items.length - 1],
      path: `M ${start} ${nodeY} Q ${middle} ${controlY} ${end} ${nodeY}`,
      labelX: middle,
      labelY,
    };
  });

  const renderRouteDetails = (route, fromLabel, toLabel) => (
    <div dir="rtl" className="w-72 max-w-[75vw]">
      <div className="mb-2 border-b border-slate-100 pb-2">
        <div className="text-xs font-bold text-slate-700">
          {fromLabel} ← {toLabel}
        </div>
        <div
          className={`mt-1 text-[10px] font-medium ${
            route.isReturn ? "text-orange-600" : "text-blue-600"
          }`}
        >
          {route.isReturn ? "مسیر برگشت" : "مسیر رفت"} ·{" "}
          {route.items.length.toLocaleString("fa-IR")} بار
        </div>
      </div>
      <div className="max-h-56 space-y-2 overflow-y-auto pl-1">
        {[...route.items].reverse().map((item, index) => {
          const person = getWorkflowUserName(item.changed_by);
          const role =
            item.changed_by?.role?.name ||
            item.changed_by?.username ||
            item.changed_by?.email;
          return (
            <div
              key={item.id ?? `${item.changed_at}-${index}`}
              className="flex gap-2 rounded-lg bg-slate-50 p-2"
            >
              <WorkflowUserAvatar
                user={item.changed_by}
                tone={route.isReturn ? "orange" : "blue"}
                size="large"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-bold text-slate-700">
                  {person}
                </div>
                {role ? (
                  <div className="truncate text-[9px] text-slate-400">
                    {role}
                  </div>
                ) : null}
                <div className="mt-1 text-[9px] text-slate-500" dir="ltr">
                  {item.changed_at
                    ? georgianDateTimeToJalaliDateTime(item.changed_at)
                    : "زمان نامشخص"}
                </div>
                {item.comment ? (
                  <div className="mt-1 rounded bg-white px-1.5 py-1 text-[9px] leading-4 text-slate-600">
                    {item.comment}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">
            نمودار گردش سند
          </div>
          <div className="text-[10px] text-slate-400">
            آخرین کاربر روی مسیر دیده می‌شود؛ برای تاریخچه کامل روی آن کلیک کنید
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
            <span className="h-0.5 w-5 border-t border-dashed border-slate-400" />{" "}
            مسیر مراحل
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] min-w-[720px] w-full"
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
            <filter
              id="document-current-shadow"
              x="-30%"
              y="-40%"
              width="160%"
              height="180%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#2563eb"
                floodOpacity="0.18"
              />
            </filter>
          </defs>

          {steps.slice(0, -1).map((step, index) => {
            const start = point(index) - nodeWidth / 2 - 5;
            const end = point(index + 1) + nodeWidth / 2 + 8;
            return (
              <path
                key={`base-${step.value}`}
                d={`M ${start} ${nodeY} L ${end} ${nodeY}`}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="5 5"
                markerEnd="url(#document-flow-base-arrow)"
              />
            );
          })}

          {routes.map((route) => {
            const color = route.isReturn ? "#ea580c" : "#2563eb";
            const fromLabel =
              steps[route.fromIndex]?.label || route.latest.from_state;
            const toLabel =
              steps[route.toIndex]?.label || route.latest.to_state;
            const person = getWorkflowUserName(route.latest.changed_by);
            const actionTime = route.latest.changed_at
              ? georgianDateTimeToJalaliDateTime(route.latest.changed_at)
              : "زمان نامشخص";

            return (
              <g key={route.key}>
                <path
                  d={route.path}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd={
                    route.isReturn
                      ? "url(#document-flow-return-arrow)"
                      : "url(#document-flow-forward-arrow)"
                  }
                />
                <foreignObject
                  x={route.labelX - 57}
                  y={route.labelY - 15}
                  width="114"
                  height="32"
                  style={{ overflow: "visible" }}
                >
                  <div xmlns="http://www.w3.org/1999/xhtml" dir="rtl">
                    <Popover
                      trigger="click"
                      placement={route.isReturn ? "bottom" : "top"}
                      content={renderRouteDetails(route, fromLabel, toLabel)}
                    >
                      <button
                        type="button"
                        className={`flex h-[30px] w-28 cursor-pointer items-center gap-1 rounded-full border bg-white/95 px-1 shadow-sm transition hover:shadow-md ${
                          route.isReturn
                            ? "border-orange-300 hover:border-orange-500"
                            : "border-blue-300 hover:border-blue-500"
                        }`}
                        title={`${person} · ${actionTime}`}
                      >
                        <WorkflowUserAvatar
                          user={route.latest.changed_by}
                          tone={route.isReturn ? "orange" : "blue"}
                        />
                        <span className="min-w-0 flex-1 text-right">
                          <span className="block truncate text-[8px] font-bold text-slate-700">
                            {person}
                          </span>
                          <span
                            className="block truncate text-[7px] text-slate-400"
                            dir="ltr"
                          >
                            {actionTime}
                          </span>
                        </span>
                        {route.items.length > 1 ? (
                          <span
                            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[8px] font-bold text-white ${
                              route.isReturn ? "bg-orange-500" : "bg-blue-600"
                            }`}
                            title={`${route.items.length} بار جابه‌جایی`}
                          >
                            {route.items.length.toLocaleString("fa-IR")}
                          </span>
                        ) : null}
                      </button>
                    </Popover>
                  </div>
                </foreignObject>
              </g>
            );
          })}

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
                  rx="12"
                  fill={isCurrent ? "#eff6ff" : "#ffffff"}
                  stroke={isCurrent ? "#2563eb" : "#cbd5e1"}
                  strokeWidth={isCurrent ? "2.5" : "1.5"}
                  filter={
                    isCurrent ? "url(#document-current-shadow)" : undefined
                  }
                />
                <circle
                  cx={x}
                  cy={nodeY - nodeHeight / 2}
                  r={isCurrent ? "6" : "4.5"}
                  fill={isCurrent ? "#2563eb" : "#94a3b8"}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={nodeY - 2}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={isCurrent ? "#1d4ed8" : "#334155"}
                  direction="rtl"
                >
                  {step.label}
                </text>
                <text
                  x={x}
                  y={nodeY + 15}
                  textAnchor="middle"
                  fontSize="8.5"
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
              y="200"
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
  const [reviewPeriod, setReviewPeriod] = useState(null);

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
    const editionState =
      modalType === "SpecificAutomationFiles"
        ? modalData?.editions?.[0]?.state
        : modalData?.state;
    setCurrentState(editionState == null ? null : Number(editionState));
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
      is_active: fileSource.is_active ?? true,
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
    const needsReviewDate = currentState === 20 && nextState === 30;

    if (needsReviewDate && !reviewPeriod) {
      message.warning("لطفاً بازه بازبینی سند را انتخاب کنید");
      return;
    }

    try {
      // ترتیب الزامی است: ابتدا تاریخ بازبینی با PUT ذخیره می‌شود و فقط
      // بعد از موفقیت آن، تغییر state با PATCH انجام می‌شود.
      if (needsReviewDate) {
        const surveyDate = addMonthsToCurrentGregorianDate(reviewPeriod);
        await updateProductDocumentEdition({
          documentId: editionId,
          product_document_id: productDocumentId,
          edition: editionRecord?.edition,
          description: editionRecord?.description,
          reasons_editing_id:
            editionRecord?.reasons_editing?.id ??
            editionRecord?.reasons_editing_id ??
            (typeof editionRecord?.reasons_editing === "number"
              ? editionRecord.reasons_editing
              : undefined),
          is_active: editionRecord?.is_active ?? true,
          // PUT نباید مرحله را جلو ببرد؛ state فعلی بدون تغییر ارسال می‌شود.
          state: currentState,
          survey_date: surveyDate,
        });
      }

      // تغییر مرحله فقط از endpoint مخصوص PATCH انجام می‌شود.
      await updateState({
        id: editionId,
        state: nextState,
        comment,
      });

      message.success("مرحله با موفقیت بروزرسانی شد");
      setCurrentState(nextState);
      setComment("");
      setReviewPeriod(null);
      await Promise.all([refetchLogs(), refetch()]);
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.detail ||
          "ثبت تاریخ بازبینی یا بروزرسانی مرحله با خطا مواجه شد",
      );
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

            {currentState === 20 && (
              <Col span={24}>
                <Form.Item
                  label="بازه بازبینی"
                  required
                  // help="پیش از تایید سند، تاریخ بازبینی با PUT ثبت می‌شود"
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
                    disabled={isUpdating || isPatching}
                  />
                </Form.Item>
              </Col>
            )}

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
                loading={isPatching || isUpdating}
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
