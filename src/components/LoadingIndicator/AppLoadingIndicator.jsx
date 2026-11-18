import { useEffect, useState, useSyncExternalStore } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { hasPendingRequests, subscribeToRequests } from "../../Services/requestActivity.js";
import ContentLoadingIndicator from "./ContentLoadingIndicator.jsx";
import "./app-loading.css";

export default function AppLoadingIndicator({ router }) {
  const fetching = useIsFetching();
  const loadingData = useIsFetching({
    predicate: (query) => query.getObserversCount() > 0 && query.state.data === undefined,
  });
  const mutating = useIsMutating({ predicate: (mutation) => !mutation.state.isPaused });
  const requesting = useSyncExternalStore(subscribeToRequests, hasPendingRequests);
  const { initialized, navigation, revalidation } = useSyncExternalStore(
    router.subscribe,
    () => router.state,
  );
  const loadingRoute = !initialized || navigation.state !== "idle";
  const busy = Boolean(fetching || mutating || requesting || loadingRoute || revalidation !== "idle");
  const loadingContent = loadingData > 0 || loadingRoute;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!busy) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, [busy]);

  return (
    <>
      <div className="sr-only" role="status">
        {busy && visible ? "در حال بارگذاری…" : ""}
      </div>
      {busy && visible && (
        <div className="app-loading-bar" aria-hidden="true">
          <span />
        </div>
      )}
      {loadingContent && visible && (
        <div className="app-content-loading" aria-hidden="true">
          <ContentLoadingIndicator announce={false} />
        </div>
      )}
    </>
  );
}
