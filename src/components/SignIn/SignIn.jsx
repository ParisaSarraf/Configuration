import { Form, Input, Button, Typography, message, Checkbox, Alert, Popover, ConfigProvider } from "antd";
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, WarningOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useContext, useState } from "react";
import { MainContext } from "../../Services/Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { SignInFn } from "../../Services/authService";

import KineticGrid from "../KineticGrid/KineticGrid";
import "./SignIn.css";
import fa_IR from "antd/locale/fa_IR";
import { signInTheme } from "./signInTheme";

const { Title, Paragraph } = Typography;

// Original Illustrator paths: inner components rotate once, then settle.
const BrandLogo = ({ small = false }) => <span className={`signin-logo${small ? ' signin-logo--small' : ''}`} role="img" aria-label="نشان گروه مهندسی صادق یکتا"><picture><source media="(prefers-reduced-motion: reduce)" srcSet="/brand/sata.svg" /><img src="/brand/sata-motion.svg" alt="" /></picture></span>;

export function SignIn() {
  const navigate = useNavigate();
  const { setAuthToken } = useContext(MainContext);
  const [loading, setLoading] = useState(false)
  const [capsLock, setCapsLock] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [supportOpen, setSupportOpen] = useState(false);

  const onFinish = async (values) => {
    setLoading(true)
    setLoginError(null);
    try {
      const payload = {
        username: values.username,
        password: values.password,
      };
      const data = await SignInFn(payload);
      if (data && data.access) {
        setAuthToken(data.access);
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        message.success("با موفقیت وارد شدید ", 3)
        navigate("/");
      }
    } catch (error) {
      setLoginError("نام کاربری یا رمز عبور اشتباه است");
      console.error("Login error:", error);
      message.error("نام کاربری یا رمز عبور نادرست است");
    } finally {
      setLoading(false)
    }
  };

  return (
    <ConfigProvider direction="rtl" locale={fa_IR} theme={signInTheme}>
    <section className="signin-page" dir="rtl" aria-labelledby="signin-title">
      <div className="signin-layout">
      <div className="signin-form-region">
      <KineticGrid />
      <div className="signin-mobile-brand"><BrandLogo small /></div>
      <div className="signin-card">
        <div className="signin-heading">
          <Title id="signin-title" level={2}>
            ورود به سامانه مسیر
          </Title>
          <Paragraph>
            برای ادامه، نام کاربری و رمز عبور خود را وارد کنید.
          </Paragraph>
        </div>

        {loginError && <Alert className="signin-alert" type="error" showIcon message={loginError} role="alert" />}
        <Form
          className="signin-form"
          name="signin"
          requiredMark={false}
          disabled={loading}
          aria-busy={loading}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="نام کاربری"
            rules={[
              { required: true, message: "لطفا نام کاربری خود را وارد کنید" },
            ]}
          >
            <Input size="large" prefix={<UserOutlined aria-hidden="true" />} placeholder="نام کاربری خود را وارد کنید."
              autoComplete="username" autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false} dir="auto" />
          </Form.Item>

          <Form.Item
            name="password"
            label="رمز عبور"
            extra={capsLock ? <span className="signin-caps-warning" role="status"><WarningOutlined aria-hidden="true" /> کلید Caps Lock روشن است.</span> : null}
            rules={[
              { required: true, message: "لطفا رمز عبور خود را وارد کنید." },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined aria-hidden="true" />}
              placeholder="رمز عبور خود را وارد کنید."
              autoComplete="current-password"
              onKeyDown={event => setCapsLock(event.getModifierState('CapsLock'))}
              onKeyUp={event => setCapsLock(event.getModifierState('CapsLock'))}
              onBlur={() => setCapsLock(false)}
              iconRender={visible => <button type="button" disabled={loading} aria-label={visible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'} aria-pressed={visible}>
                {visible ? <EyeInvisibleOutlined aria-hidden="true" /> : <EyeOutlined aria-hidden="true" />}
              </button>}
            />
          </Form.Item>

          <div className="signin-options">
            <Checkbox aria-describedby="signin-remember-help" title="این گزینه فعلاً فقط نمایشی است">مرا به خاطر بسپار</Checkbox>
            <Link to="/forget-password" className="signin-link">فراموشی رمز</Link>
          </div>
          <span id="signin-remember-help" className="sr-only">این گزینه فعلاً نمایشی است و ماندگاری نشست را تغییر نمی‌دهد.</span>
          <Button className="signin-submit" aria-label={loading ? "در حال ورود…" : "ورود"} type="primary" htmlType="submit" block size="large" loading={loading} disabled={loading}>
            <span>{loading ? "در حال ورود…" : "ورود"}</span>
            {!loading && <ArrowLeftOutlined className="signin-submit-arrow" aria-hidden="true" />}
          </Button>

        </Form>
      </div>

      <footer className="signin-footer"><span>© ۱۴۰۵ گروه مهندسی صادق یکتا · </span>
        <Popover trigger="click" placement="top" open={supportOpen} onOpenChange={setSupportOpen} overlayClassName="signin-support-popover"
          content={<p id="signin-support" className="signin-support-note">برای دریافت راهنمایی، با مدیر سامانه سازمان خود تماس بگیرید.</p>}>
          <a href="#signin-support" className="signin-link" aria-expanded={supportOpen} aria-controls={supportOpen ? 'signin-support' : undefined} onClick={event => event.preventDefault()}>پشتیبانی</a>
        </Popover>
      </footer>
      </div>
      <aside className="signin-banner" aria-label="گروه مهندسی صادق یکتا، دانش‌بنیان">
        <img className="signin-brand-art" src="/banner.jpg" alt="" aria-hidden="true" />
        <div className="signin-brand-content"><BrandLogo />
          <p className="signin-brand-eyebrow">گروه مهندسی</p>
          <p className="signin-brand-name">صادق یکتا</p>
          <p className="signin-brand-caption">دانش بنیان</p>
        </div>
      </aside>
      </div>
    </section>
    </ConfigProvider>
  );
}

export default SignIn;
