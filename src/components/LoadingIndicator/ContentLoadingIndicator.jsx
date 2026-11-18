import { Spin } from "antd";
import "./app-loading.css";

export default function ContentLoadingIndicator({
  message = "در حال بارگذاری…",
  announce = true,
}) {
  return (
    <div className="app-page-loading" role={announce ? "status" : undefined}>
      <Spin tip={message} size="large">
        <div className="app-page-loading-space" />
      </Spin>
    </div>
  );
}
