import { useEffect, useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  PartitionOutlined,
} from "@ant-design/icons";
import { Alert, Button, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Layouts/Header.jsx";
import ProductThemePicker from "@/components/Theme/ProductThemePicker.jsx";
import MyActivities from "@/pages/MyWork/MyActivities/MyActivities.jsx";
import MyDocuments from "@/pages/MyWork/MyDocuments/MyDocuments.jsx";
import MyPlan from "@/pages/MyWork/MyPlan/MyPlan.jsx";
import Waiting from "@/pages/MyWork/Waiting/Waiting.jsx";
import ProcessMaker from "@/pages/ProcessMaker/ProcessMaker.jsx";
import {
  useGetActivitiesInPlanState,
  useGetActivityUserPerformance,
  useGetDocumentWorkflowTasks,
  useGetExpertActivity,
  useGetExpertActivityInPlanState,
} from "@/QueryServises/PanelQuery/index.js";
import {
  useProcessList,
  useRequestsNeedUserAction,
} from "@/QueryServises/workflowQuery/index.js";
import { getUserFromToken } from "@/utils/ExportFromToken.js";
import { useProductTheme } from "@/components/Theme/ProductThemeContext.jsx";
import "./work-cartable.css";

const ACCESS_QUERY_OPTIONS = {
  retry: false,
  staleTime: 60 * 1000,
  refetchOnWindowFocus: false,
};

const isAccessDenied = (query) =>
  query?.isError && [401, 403].includes(Number(query.error?.response?.status));

const MyWork = () => {
  const navigate = useNavigate();
  const { globalTheme } = useProductTheme();
  const currentUser = useMemo(() => getUserFromToken(), []);
  const [activeKey, setActiveKey] = useState(null);

  // The current-user endpoints are the source of truth for personal sections.
  // Keep every tab visible. Authorization errors are shown inside the
  // selected section instead of removing it from navigation.
  const activitiesAccess = useGetExpertActivity(ACCESS_QUERY_OPTIONS);
  const waitingAccess = useGetExpertActivityInPlanState(ACCESS_QUERY_OPTIONS);
  const planAccess = useGetActivitiesInPlanState(ACCESS_QUERY_OPTIONS);
  const documentsAccess = useGetDocumentWorkflowTasks(ACCESS_QUERY_OPTIONS);
  const performanceQuery = useGetActivityUserPerformance(ACCESS_QUERY_OPTIONS);

  // Process-maker capabilities are resolved independently by the server:
  // process-list permission exposes start/monitor, and need-action permission
  // exposes the user's actionable requests.
  const processListAccess = useProcessList(ACCESS_QUERY_OPTIONS);
  const processActionsAccess = useRequestsNeedUserAction(
    {},
    ACCESS_QUERY_OPTIONS,
  );

  const activityAllowed = !isAccessDenied(activitiesAccess);
  const waitingAllowed = !isAccessDenied(waitingAccess);
  const planAllowed = !isAccessDenied(planAccess);
  const documentsAllowed = !isAccessDenied(documentsAccess);
  const processMakerAllowed =
    !isAccessDenied(processListAccess) ||
    !isAccessDenied(processActionsAccess);

  const sections = useMemo(
    () => [
      {
        key: "activities",
        label: "فعالیت‌های باقیمانده",
        icon: <HistoryOutlined />,
        allowed: activityAllowed,
        content: <MyActivities />,
      },
      {
        key: "waiting",
        label: "در انتظار تأیید",
        icon: <ClockCircleOutlined />,
        allowed: waitingAllowed,
        content: <Waiting />,
      },
      {
        key: "plans",
        label: "کارهای من",
        icon: <CheckCircleOutlined />,
        allowed: planAllowed,
        content: <MyPlan />,
      },
      {
        key: "documents",
        label: "اسناد من",
        icon: <FileDoneOutlined />,
        allowed: documentsAllowed,
        content: <MyDocuments />,
      },
      {
        key: "processes",
        label: "فرآیندساز",
        icon: <PartitionOutlined />,
        allowed: processMakerAllowed,
        content: <ProcessMaker embedded />,
      },
    ],
    [
      activityAllowed,
      waitingAllowed,
      planAllowed,
      documentsAllowed,
      processMakerAllowed,
    ],
  );
  const visibleSections = sections;

  useEffect(() => {
    if (
      !visibleSections.some((section) => section.key === activeKey) &&
      visibleSections.length
    ) {
      setActiveKey(visibleSections[0].key);
    }
  }, [activeKey, visibleSections]);

  const activeSection = visibleSections.find(
    (section) => section.key === activeKey,
  );

  return (
    <div
      className="work-cartable"
      data-theme={globalTheme}
      dir="rtl"
    >
      <Header />
      <div className="work-cartable__container">
        <header className="work-cartable__header">
          <div className="work-cartable__heading">
            <div>
              <Button
                type="text"
                onClick={() => navigate("/")}
                className="work-cartable__back"
              >
                بازگشت به صفحه اصلی
              </Button>
              <h1>
                کارتابل{" "}
                <span>{currentUser?.displayName || "کاربر"}</span>
              </h1>
              <p>همهٔ کارهای شخصی و گردش‌های کاری شما در یکجا</p>
            </div>
            <div className="work-cartable__header-actions">
              {performanceQuery.data?.[0]?.avg_performance != null ? (
                <div className="work-cartable__performance">
                  <span>درصد عملکرد</span>
                  <strong>
                    {performanceQuery.data[0].avg_performance}٪
                  </strong>
                </div>
              ) : null}
              <ProductThemePicker
                moduleKey="global"
                moduleLabel="کل سیستم"
                globalOnly
              />
            </div>
          </div>

          {visibleSections.length ? (
            <nav
              className="work-cartable__nav"
              aria-label="بخش‌های کارتابل"
            >
              {visibleSections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  className={`work-cartable__nav-item ${
                    activeKey === section.key ? "is-active" : ""
                  }`}
                  aria-current={activeKey === section.key ? "page" : undefined}
                  onClick={() => setActiveKey(section.key)}
                >
                  <span className="work-cartable__nav-icon">
                    {section.icon}
                  </span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          ) : null}
        </header>

        <main className="work-cartable__content">
          {activeSection ? (
            <section
              key={activeSection.key}
              className="work-cartable__section"
              aria-label={activeSection.label}
            >
              {activeSection.allowed || activeSection.key === "processes" ? (
                activeSection.content
              ) : (
                <Alert
                  type="warning"
                  showIcon
                  message="شما دسترسی مشاهده این بخش را ندارید."
                />
              )}
            </section>
          ) : (
            <Empty
              className="work-cartable__empty"
              description="برای بخش‌های کارتابل دسترسی فعالی ندارید."
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default MyWork;