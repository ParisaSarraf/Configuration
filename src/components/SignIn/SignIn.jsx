import { Form, Input, Button, Typography, message } from "antd";
import { useContext, useState } from "react";
import { MainContext } from "../../Services/Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { SignInFn } from "../../Services/authService";

import KineticGrid from "../KineticGrid/KineticGrid";
import "./SignIn.css";

const { Title, Paragraph } = Typography;

export function SignIn() {
  const navigate = useNavigate();
  const { setAuthToken } = useContext(MainContext);
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
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
      console.error("Login error:", error);
      message.error("نام کاربری یا رمز عبور نادرست است");
    } finally {
      setLoading(false)
    }
  };

  return (
    <section className="signin-page" dir="rtl" aria-labelledby="signin-title">
      <KineticGrid />
      <div className="signin-layout">
      <div className="signin-card">
        <div className="signin-heading">
          <Title id="signin-title" level={2}>
            ورود
          </Title>
          <Paragraph>
            لطفا رمز عبور و نام کاربری خود را وارد کنید
          </Paragraph>
        </div>

        <Form
          className="signin-form"
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
            <Input size="large" placeholder="نام کاربری" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="رمزعبور"
            rules={[
              { required: true, message: "لطفا رمز عبور خود را وارد کنید" },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="********"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            {loading ? "" : "ورود"}
          </Button>

          <div className="signin-forgot">
            <Button type="text" className="signin-forgot-button">
              <Link to="/forget-password" className="signin-link">
                فراموشی رمز
              </Link>
            </Button>
          </div>

        </Form>
      </div>

      <figure className="signin-banner">
        <img src="/banner.jpg" alt="گروه مهندسی صادق یکتا، دانش‌بنیان" width="640" height="1280" />
      </figure>
      </div>
    </section>
  );
}

export default SignIn;
