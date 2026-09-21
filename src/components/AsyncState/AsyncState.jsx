import { Alert, Button, Empty, Skeleton } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { getApiErrorMessage } from "@/Services/forms/formUtils";

export const LoadingState = ({ rows = 4, label = "در حال دریافت اطلاعات…" }) => (
  <section className="async-state" aria-busy="true" aria-label={label}>
    <span className="async-state__label">{label}</span>
    <Skeleton active paragraph={{ rows }} title={false} />
  </section>
);

export const ErrorState = ({ error, onRetry, title = "دریافت اطلاعات ناموفق بود" }) => (
  <Alert
    className="async-state"
    type="error"
    showIcon
    role="alert"
    message={title}
    description={getApiErrorMessage(error, "ارتباط با سامانه برقرار نشد. لطفاً دوباره تلاش کنید.")}
    action={onRetry ? <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>تلاش دوباره</Button> : null}
  />
);

export const EmptyState = ({ description = "اطلاعاتی برای نمایش وجود ندارد" }) => (
  <Empty className="async-state" image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
);
