import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  Empty,
  Skeleton,
  Select,
  Tag,
} from "antd";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import Header from "@/components/Layouts/Header.jsx";
import { useRoleList } from "@/QueryServises/roleQuery";
import {
  useLockedFieldsByProcessId,
  useProcessInfo,
  useProcessKpis,
  useProcessStateDurationStats,
  useProcessStateRequestCounts,
  useTransitionActions,
} from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import {
  buildGraph,
  pickProcessInfo,
  validateGraph,
} from "./ProcessBuilder/processGraph";
import ProcessFlowOverview from "./components/ProcessFlowOverview";
import StationDurationJourney from "./components/StationDurationJourney";

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const number = (value) => Math.max(0, Number(value) || 0);
const formatNumber = (value) => number(value).toLocaleString("fa-IR");
const roleId = (role) => String(role?.id ?? role?.pk ?? "");
const roleName = (role) => role?.name ?? role?.title ?? "سمت بدون نام";

const Metric = ({ icon, label, value, detail, tone = "slate" }) => {
  const tones = {
    indigo: "theme-accent-soft theme-accent dark:theme-accent-soft-40",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40",
    slate: "theme-panel theme-muted dark:theme-panel",
  };
  return (
    <div className="rounded-2xl border theme-border theme-surface p-4 shadow-sm dark:theme-border dark:theme-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs theme-muted dark:theme-muted">
            {label}
          </div>
          <div className="mt-2 text-2xl font-black tabular-nums theme-text dark:theme-on-accent">
            {value}
          </div>
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${tones[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 text-[11px] theme-muted">{detail}</div>
    </div>
  );
};

const Section = ({ title, description, extra, children }) => (
  <section className="rounded-2xl border theme-border theme-surface p-4 shadow-sm sm:p-5 dark:theme-border dark:theme-panel">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="m-0 text-base font-bold theme-text dark:theme-muted">
          {title}
        </h2>
        {description ? (
          <p className="mb-0 mt-1 text-xs leading-6 theme-muted">
            {description}
          </p>
        ) : null}
      </div>
      {extra}
    </div>
    {children}
  </section>
);

const StationChart = ({ states }) => {
  const max = Math.max(1, ...states.map((state) => state.count));
  if (!states.length)
    return <Empty description="گزارشی برای ایستگاه‌های فرایند وجود ندارد" />;
  return (
    <div className="space-y-4">
      {states.map((state) => (
        <div key={state.id ?? state.name}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-semibold theme-text dark:theme-muted">
              {state.name}
            </span>
            <span className="tabular-nums theme-muted">
              {formatNumber(state.count)} درخواست
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full theme-panel dark:theme-panel">
            <div
              className="h-full rounded-full bg-gradient-to-l theme-gradient transition-all duration-500"
              style={{
                width: `${state.count ? Math.max(4, (state.count / max) * 100) : 0}%`,
              }}
              role="img"
              aria-label={`${state.name}: ${state.count} درخواست`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusChart = ({ kpi }) => {
  const data = [
    {
      key: "normal",
      label: "جاری",
      value: number(kpi?.count_of_normal_request),
      color: "theme-accent-bg",
    },
    {
      key: "complete",
      label: "تکمیل‌شده",
      value: number(kpi?.count_of_completed_request),
      color: "bg-emerald-500",
    },
    {
      key: "denied",
      label: "ردشده",
      value: number(kpi?.count_of_denied_request),
      color: "bg-rose-500",
    },
  ];
  const total = Math.max(1, data.reduce((sum, item) => sum + item.value, 0));
  return (
    <div>
      <div className="mb-5 flex h-4 overflow-hidden rounded-full theme-panel dark:theme-panel">
        {data.map((item) =>
          item.value ? (
            <div
              key={item.key}
              className={item.color}
              style={{ width: `${(item.value / total) * 100}%` }}
              title={`${item.label}: ${item.value}`}
            />
          ) : null,
        )}
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl theme-canvas px-3 py-2.5 dark:theme-panel-60"
          >
            <span className="flex items-center gap-2 text-xs theme-muted dark:theme-muted">
              <i className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              {item.label}
            </span>
            <strong className="tabular-nums theme-text dark:theme-muted">
              {formatNumber(item.value)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const StationDurationStats = ({ rows, graph, isLoading, error, onRetry }) => {
  if (isLoading)
    return <Skeleton active paragraph={{ rows: 4 }} title={false} />;
  if (error)
    return (
      <Alert
        type="warning"
        showIcon
        message="دریافت گزارش زمانی ایستگاه‌ها انجام نشد"
        description={getApiErrorMessage(error)}
        action={<Button onClick={onRetry}>تلاش مجدد</Button>}
      />
    );
  if (!rows.length)
    return <Empty description="گزارش زمانی برای ایستگاه‌های فرایند وجود ندارد" />;

  return <StationDurationJourney rows={rows} graph={graph} />;
};

const ProcessDashboardContent = () => {
  const navigate = useNavigate();
  const { processId } = useParams();
  const { message } = App.useApp();
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const infoQuery = useProcessInfo(processId, { retry: false });
  const kpisQuery = useProcessKpis({ retry: false });
  const statesQuery = useProcessStateRequestCounts(processId, { retry: false });
  const durationStatsQuery = useProcessStateDurationStats(processId, {
    retry: false,
  });
  const actionsQuery = useTransitionActions({ retry: false });
  const locksQuery = useLockedFieldsByProcessId(processId, { retry: false });
  const rolesQuery = useRoleList({ retry: false });

  const info = pickProcessInfo(infoQuery.data);
  const kpi = useMemo(
    () =>
      asArray(kpisQuery.data).find(
        (item) => String(item?.id) === String(processId),
      ) ?? null,
    [kpisQuery.data, processId],
  );
  const states = useMemo(
    () =>
      asArray(statesQuery.data).map((item) => ({
        id: item?.id,
        name: item?.name || "ایستگاه بدون نام",
        count: number(item?.request_count),
      })),
    [statesQuery.data],
  );
  const durationStats = useMemo(
    () =>
      asArray(durationStatsQuery.data).map((item) => ({
        id: item?.state_id ?? item?.id,
        name:
          item?.state__name ||
          item?.state_name ||
          item?.name ||
          "ایستگاه بدون نام",
        average: item?.avg_duration,
        minimum: item?.min_duration,
        maximum: item?.max_duration,
        total: item?.total_duration,
        visitCount: item?.visit_count ?? null,
        requestCount: item?.request_count ?? null,
      })),
    [durationStatsQuery.data],
  );
  const graph = useMemo(
    () =>
      buildGraph(
        infoQuery.data,
        asArray(actionsQuery.data),
        locksQuery.data,
      ),
    [actionsQuery.data, infoQuery.data, locksQuery.data],
  );

  const access = useMemo(() => {
    const grouped = new Map();
    (graph?.permissions ?? []).forEach((permission) => {
      const key =
        permission.granteeType === "creator"
          ? "creator"
          : String(permission.groupId ?? permission.groupName);
      const current = grouped.get(key) ?? {
        id: key,
        name:
          permission.granteeType === "creator"
            ? "ایجادکننده درخواست"
            : permission.groupName || "سمت بدون نام",
        permissions: new Set(),
      };
      current.permissions.add(permission.permissionType);
      grouped.set(key, current);
    });
    const allowed = Array.from(grouped.values());
    const allowedIds = new Set(allowed.map((item) => String(item.id)));
    const denied = asArray(rolesQuery.data).filter(
      (role) => !allowedIds.has(roleId(role)),
    );
    return { allowed, denied };
  }, [graph?.permissions, rolesQuery.data]);

  const lockRows = useMemo(() => {
    const fieldsById = new Map(
      (graph?.formFields ?? []).map((field) => [
        String(field?.id),
        field?.label ??
          field?.field_label ??
          field?.name ??
          `فیلد ${field?.id}`,
      ]),
    );
    return (graph?.nodes ?? [])
      .filter((node) => node.lockedFieldIds?.length)
      .map((node) => ({
        id: node.id,
        state: node.name,
        fields: node.lockedFieldIds.map(
          (id) => fieldsById.get(String(id)) ?? `فیلد ${id}`,
        ),
      }));
  }, [graph]);
  const health = useMemo(() => validateGraph(graph), [graph]);
  const stateCountMap = useMemo(
    () =>
      new Map(
        states.map((state) => [String(state.id), Number(state.count) || 0]),
      ),
    [states],
  );
  const roleOptions = useMemo(
    () =>
      asArray(rolesQuery.data).map((role) => ({
        value: role?.id ?? role?.pk,
        label: roleName(role),
      })),
    [rolesQuery.data],
  );

  const refreshAll = async () => {
    await Promise.all([
      infoQuery.refetch(),
      kpisQuery.refetch(),
      statesQuery.refetch(),
      durationStatsQuery.refetch(),
      actionsQuery.refetch(),
      locksQuery.refetch(),
      rolesQuery.refetch(),
    ]);
    message.success("اطلاعات داشبورد به‌روزرسانی شد.");
  };

  const isLoading =
    infoQuery.isLoading || kpisQuery.isLoading || statesQuery.isLoading;
  const fatalError = infoQuery.error || kpisQuery.error;

  if (isLoading)
    return (
      <div className="mx-auto max-w-screen-xl p-4 sm:p-6">
        <Skeleton active paragraph={{ rows: 14 }} />
      </div>
    );

  if (fatalError)
    return (
      <div className="mx-auto max-w-screen-xl p-4 sm:p-6">
        <Alert
          type="error"
          showIcon
          message="دریافت داشبورد فرایند انجام نشد"
          description={getApiErrorMessage(fatalError)}
          action={<Button onClick={refreshAll}>تلاش مجدد</Button>}
        />
      </div>
    );

  const total = number(kpi?.count_of_request);
  const stationTotal = states.reduce((sum, state) => sum + state.count, 0);

  return (
    <main className="mx-auto max-w-screen-xl p-4 sm:p-6">
      <Button
        type="text"
        icon={<ArrowRightOutlined />}
        onClick={() => navigate("/processes")}
        className="mb-4"
      >
        بازگشت به فرایندها
      </Button>

      <div className="themed-page-header overflow-hidden rounded-3xl bg-gradient-to-l theme-gradient theme-gradient p-5 theme-on-accent shadow-lg sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs theme-accent">
              <ApartmentOutlined />
              داشبورد فرایند
            </div>
            <h1 className="m-0 text-xl font-black sm:text-2xl">
              {kpi?.name || info?.name || "فرایند"}
            </h1>
            <p className="mb-0 mt-2 max-w-2xl text-xs leading-6 theme-muted">
              وضعیت درخواست‌ها، مسیر گردش، دسترسی سمت‌ها و قواعد قفل فیلدها در
              یک نمای یکپارچه
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<ReloadOutlined />}
              loading={
                infoQuery.isFetching ||
                kpisQuery.isFetching ||
                statesQuery.isFetching || durationStatsQuery.isFetching
              }
              onClick={refreshAll}
            >
              به‌روزرسانی
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => navigate(`/processes/${processId}/builder`)}
            >
              فرایندساز
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<ApartmentOutlined />}
          label="کل درخواست‌ها"
          value={formatNumber(total)}
          detail="طبق KPI فرایند"
          tone="indigo"
        />
        <Metric
          icon={<ThunderboltOutlined />}
          label="درخواست‌های جاری"
          value={formatNumber(kpi?.count_of_normal_request)}
          detail="در حال گردش بین ایستگاه‌ها"
          tone="amber"
        />
        <Metric
          icon={<CheckCircleOutlined />}
          label="تکمیل‌شده"
          value={formatNumber(kpi?.count_of_completed_request)}
          detail="با موفقیت به پایان رسیده"
          tone="emerald"
        />
        <Metric
          icon={<CloseCircleOutlined />}
          label="ردشده"
          value={formatNumber(kpi?.count_of_denied_request)}
          detail="پایان‌یافته با نتیجه رد"
          tone="rose"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <Section
          title="درخواست‌ها به تفکیک ایستگاه"
          description="تعداد درخواست‌های حاضر در هر ایستگاه؛ داده از گزارش ایستگاه‌های فرایند دریافت می‌شود."
          extra={
            <Tag color="blue" className="m-0">
              {formatNumber(stationTotal)} درخواست
            </Tag>
          }
        >
          <StationChart states={states} />
        </Section>
        <Section
          title="ترکیب وضعیت درخواست‌ها"
          description="خلاصه جاری، تکمیل‌شده و ردشده از API جدید KPI"
        >
          <StatusChart kpi={kpi} />
        </Section>
      </div>

      <div className="mt-4">
        <Section
          title="گزارش زمانی ایستگاه‌ها"
          description="نمای بصری زمان توقف درخواست‌ها روی مسیر ایستگاه‌های فرایند"
          extra={
            <Tag color="purple" className="m-0">
              {formatNumber(durationStats.length)} ایستگاه
            </Tag>
          }
        >
          <StationDurationStats
            rows={durationStats}
            graph={graph}
            isLoading={durationStatsQuery.isLoading}
            error={durationStatsQuery.error}
            onRetry={durationStatsQuery.refetch}
          />
        </Section>
      </div>

      <div className="mt-4">
        <Section
          title="مسیر کلی فرایند"
          description="نقشه زنده ایستگاه‌ها؛ تعداد درخواست و دسترسی هر سمت مستقیماً روی مسیر دیده می‌شود."
          extra={
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              className="min-w-[220px]"
              placeholder="Role Lens: نمایش برای همه"
              value={selectedRoleId}
              options={roleOptions}
              onChange={(value) => setSelectedRoleId(value ?? null)}
            />
          }
        >
          <ProcessFlowOverview
            graph={graph}
            selectedRoleId={selectedRoleId}
            stateCounts={stateCountMap}
          />
        </Section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Section
          title="سلامت فرایند"
          description="بررسی خودکار بن‌بست‌ها، مسیرهای ناقص، Actionها و دسترسی‌ها"
          extra={
            health.errors.length ? (
              <Tag color="error">{health.errors.length} خطا</Tag>
            ) : health.warnings.length ? (
              <Tag color="warning">{health.warnings.length} هشدار</Tag>
            ) : (
              <Tag color="success">سالم</Tag>
            )
          }
        >
          {!health.errors.length && !health.warnings.length ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
              <CheckCircleOutlined className="text-3xl text-emerald-500" />
              <div className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                مسیر فرایند آماده اجراست
              </div>
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {[...health.errors, ...health.warnings].map((issue, index) => (
                <div
                  key={`${issue}-${index}`}
                  className={`flex gap-2 rounded-xl p-3 text-xs leading-6 ${
                    index < health.errors.length
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                  }`}
                >
                  <WarningOutlined className="mt-1 shrink-0" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="دسترسی سمت‌ها"
          description="سمت‌های دارای دسترسی در فرایند و سطح مشاهده یا ویرایش آن‌ها"
          extra={<TeamOutlined className="theme-muted" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-bold text-emerald-700">
                دارای دسترسی
              </div>
              <div className="space-y-2">
                {access.allowed.length ? (
                  access.allowed.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/30"
                    >
                      <span className="truncate text-xs font-semibold theme-text dark:theme-muted">
                        {item.name}
                      </span>
                      <span className="flex shrink-0 gap-1">
                        {item.permissions.has("view") ? (
                          <Tag color="blue" className="m-0">
                            <EyeOutlined /> مشاهده
                          </Tag>
                        ) : null}
                        {item.permissions.has("edit") ? (
                          <Tag color="green" className="m-0">
                            ویرایش
                          </Tag>
                        ) : null}
                      </span>
                    </div>
                  ))
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="دسترسی ثبت نشده"
                  />
                )}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-bold theme-muted">
                بدون دسترسی مستقیم
              </div>
              <div className="flex flex-wrap gap-2">
                {access.denied.length ? (
                  access.denied.map((role) => (
                    <Tag key={roleId(role)} className="m-0">
                      {roleName(role)}
                    </Tag>
                  ))
                ) : (
                  <span className="text-xs theme-muted">
                    سمت دیگری برای مقایسه پیدا نشد.
                  </span>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="قواعد قفل فیلدها"
          description="فیلدهای زیر بعد از خروج درخواست از ایستگاه انتخاب‌شده در مراحل بعدی قفل می‌شوند."
          extra={<LockOutlined className="text-amber-500" />}
        >
          {lockRows.length ? (
            <div className="space-y-3">
              {lockRows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold theme-text dark:theme-muted">
                    <SafetyCertificateOutlined className="text-amber-600" />
                    بعد از ایستگاه «{row.state || "بدون نام"}»
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {row.fields.map((field) => (
                      <Tag key={field} className="m-0">
                        {field}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="قانون قفل فیلدی ثبت نشده است"
            />
          )}
        </Section>
      </div>
    </main>
  );
};

const ProcessDashboard = () => (
  <ConfigProvider direction="rtl">
    <App>
      <div className="min-h-screen theme-canvas dark:theme-panel" dir="rtl">
        <Header />
        <ProcessDashboardContent />
      </div>
    </App>
  </ConfigProvider>
);

export default ProcessDashboard;