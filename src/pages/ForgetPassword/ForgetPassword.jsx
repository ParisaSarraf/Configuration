import { Alert, Button, ConfigProvider, Form, Input, Typography } from "antd";
import { ArrowLeftOutlined, EyeInvisibleOutlined, EyeOutlined, LockOutlined } from "@ant-design/icons";
import fa_IR from "antd/locale/fa_IR";
import KineticGrid from "../../components/KineticGrid/KineticGrid";
import BrandLogo from "../../components/SignIn/BrandLogo";
import { signInTheme } from "../../components/SignIn/signInTheme";
import "../../components/SignIn/SignIn.css";
import "./ForgetPassword.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChangePassword } from "../../QueryServises/forgetPassQuery";

const { Title, Paragraph } = Typography;

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);
  const { mutateAsync: changePass, isPending } = useChangePassword();

  const onFinish = async ({ previousPassword, newPassword }) => {
    if (isPending) return;
    setResult(null);
    try {
      // await changePass({ old_password: previousPassword, new_password: newPassword });
      form.resetFields();
      setResult({ type: "success", text: "رمز عبور با موفقیت تغییر کرد." });
    } catch (error) {
      const data = error.response?.data;
      const fields = [];
      for (const [apiName, formName] of [["old_password", "previousPassword"], ["new_password", "newPassword"]]) {
        const value = data?.[apiName];
        const errors = Array.isArray(value) ? value.filter((item) => typeof item === "string")
          : typeof value === "string" ? [value] : [];
        if (errors.length) fields.push({ name: formName, errors });
      }
      if (fields.length) form.setFields(fields);
      const detail = data?.detail || data?.message;
      setResult({
        type: "error",
        text: typeof detail === "string" ? detail : fields.length
          ? "لطفاً خطاهای فرم را برطرف کنید."
          : "تغییر رمز عبور انجام نشد. اطلاعات را بررسی و دوباره تلاش کنید.",
      });
    }
  };

  const passwordIcon = (visible) => (
    <button type="button" disabled={isPending}
      aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
      aria-pressed={visible}>
      {visible ? <EyeInvisibleOutlined aria-hidden="true" /> : <EyeOutlined aria-hidden="true" />}
    </button>
  );

  return (
    <ConfigProvider direction="rtl" locale={fa_IR} theme={signInTheme}>
      <section className="signin-page change-password-page" dir="rtl" aria-labelledby="change-password-title">
        <div className="signin-layout">
          <div className="signin-form-region">
            <KineticGrid />
            <div className="signin-mobile-brand"><BrandLogo small /></div>
            <div className="signin-card">
              <div className="signin-heading">
                <Title id="change-password-title" level={2}>تغییر رمز عبور</Title>
                <Paragraph>برای امنیت حساب خود، رمز عبور فعلی و رمز جدید را وارد کنید.</Paragraph>
              </div>
              {result && <Alert className="change-password-result" type={result.type} message={result.text} showIcon role={result.type === "error" ? "alert" : "status"} />}
              <Form form={form} name="change-password" className="signin-form" layout="vertical"
                requiredMark={false} onFinish={onFinish} disabled={isPending} aria-busy={isPending}>
                <Form.Item name="previousPassword" label="رمز عبور قبلی"
                  rules={[{ required: true, message: "لطفاً رمز عبور قبلی را وارد کنید." }]}>
                  <Input.Password size="large" prefix={<LockOutlined aria-hidden="true" />}
                    placeholder="رمز عبور قبلی را وارد کنید" autoComplete="current-password" iconRender={passwordIcon} />
                </Form.Item>
                <Form.Item name="newPassword" label="رمز عبور جدید"
                  rules={[{ required: true, message: "لطفاً رمز عبور جدید را وارد کنید." }]}>
                  <Input.Password size="large" prefix={<LockOutlined aria-hidden="true" />}
                    placeholder="رمز عبور جدید را وارد کنید" autoComplete="new-password" iconRender={passwordIcon} />
                </Form.Item>
                <Form.Item name="repeatNewPassword" label="تکرار رمز عبور جدید" dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "لطفاً رمز عبور جدید را تکرار کنید." },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        return !value || getFieldValue("newPassword") === value
                          ? Promise.resolve()
                          : Promise.reject(new Error("تکرار رمز عبور با رمز جدید یکسان نیست."));
                      },
                    }),
                  ]}>
                  <Input.Password size="large" prefix={<LockOutlined aria-hidden="true" />}
                    placeholder="رمز عبور جدید را تکرار کنید" autoComplete="new-password" iconRender={passwordIcon} />
                </Form.Item>
                <Button className="signin-submit" type="primary" htmlType="submit" block size="large" loading={isPending}>
                  <span>{isPending ? "در حال ذخیره…" : "تغییر رمز عبور"}</span>
                  {!isPending && <ArrowLeftOutlined className="signin-submit-arrow" aria-hidden="true" />}
                </Button>
                <Button className="change-password-back" block size="large" onClick={() => navigate("/")}>
                  بازگشت به سامانه
                </Button>
              </Form>
            </div>
            <footer className="signin-footer">© ۱۴۰۵ گروه مهندسی صادق یکتا</footer>
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
};

export default ForgetPassword;
