import { useEffect, useRef, useState } from "react";
import { App, Button } from "antd";
import { ReloadOutlined, WifiOutlined } from "@ant-design/icons";
import {
  useIsFetching,
  useIsMutating,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiErrorMessage } from "@/Services/forms/formUtils";

const QueryFeedbackBridge = () => {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { notification } = App.useApp();
  const shownErrors = useRef(new Map());
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const isBusy = isFetching + isMutating > 0;

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (event?.type !== "updated" || event?.action?.type !== "error") return;

      const query = event.query;
      const updatedAt = query.state.errorUpdatedAt;
      if (!updatedAt || shownErrors.current.get(query.queryHash) === updatedAt) return;
      shownErrors.current.set(query.queryHash, updatedAt);

      const status = Number(query.state.error?.response?.status);
      if (status === 401) return;

      const key = `query-error-${query.queryHash}`;
      notification.error({
        key,
        placement: "bottomLeft",
        message: "دریافت اطلاعات ناموفق بود",
        description: getApiErrorMessage(
          query.state.error,
          "اطلاعات دریافت نشد. لطفاً دوباره تلاش کنید.",
        ),
        duration: 8,
        btn: (
          <Button
            size="small"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              notification.destroy(key);
              query.fetch();
            }}
          >
            تلاش دوباره
          </Button>
        ),
      });
    });
  }, [notification, queryClient]);

  return (
    <>
      <div
        className={`global-request-progress ${isBusy ? "is-visible" : ""}`}
        role="progressbar"
        aria-hidden={!isBusy}
        aria-label="در حال دریافت اطلاعات"
      >
        <span />
      </div>
      {!isOnline ? (
        <div className="offline-banner" role="status">
          <WifiOutlined />
          <span>اتصال اینترنت قطع است؛ پس از اتصال دوباره تلاش می‌کنیم.</span>
        </div>
      ) : null}
    </>
  );
};

export default QueryFeedbackBridge;
