import { Component } from "react";
import { Button, Result } from "antd";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error("UI error boundary:", error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-fallback" dir="rtl" role="alert">
        <Result
          status="error"
          title="نمایش این بخش با مشکل مواجه شد"
          subTitle="اطلاعات شما از بین نرفته است. دوباره تلاش کنید؛ اگر مشکل ادامه داشت، صفحه را تازه‌سازی کنید."
          extra={[
            <Button type="primary" key="retry" onClick={this.reset}>تلاش دوباره</Button>,
            <Button key="reload" onClick={() => window.location.reload()}>تازه‌سازی صفحه</Button>,
          ]}
        />
      </main>
    );
  }
}

export default ErrorBoundary;
