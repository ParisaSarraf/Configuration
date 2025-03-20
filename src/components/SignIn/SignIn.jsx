import { Form, Input, Button, Typography, message } from "antd";
import { Suspense, useContext, useState } from "react";
import { MainContext } from "../../Services/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { SignInFn } from "../../utils/Api";

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
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Title level={2} className="font-bold mb-4">
            ورود{" "}
          </Title>
          <Paragraph className="text-gray-600 text-lg">
            لطفا رمز عبور و نام کاربری خود را وارد کنید
          </Paragraph>
        </div>

        <Form
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
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
            <Input size="large" placeholder="نام کاربری" className="w-full" />
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
              className="w-full"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            {loading ? "" : "ورود"}
          </Button>

          <div className="flex justify-between items-center mt-6">
            <Button type="text" className="text-gray-900 hover:text-gray-600">
              <Link to="/forget-password" className="text-gray-900 ml-1">
                فراموشی رمز
              </Link>
            </Button>
          </div>

          <Paragraph className="text-center text-gray-500 mt-4">
            ثبت نام نیستید؟
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">
              حساب کاربری بسازید
            </Link>
          </Paragraph>
        </Form>
      </div>

      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="assets/img/pattern.webp"
          className="h-full w-full object-cover rounded-3xl"
          alt="Background pattern"
        />
      </div>
    </section>
  );
}

export default SignIn;
