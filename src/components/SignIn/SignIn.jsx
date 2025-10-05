import {Button, Form, Input, message, Typography} from "antd";
import {useContext, useState} from "react";
import {MainContext} from "../../Services/Context/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import {SignInFn} from "@/Services/authService.js";
import {ArrowLeftOutlined, LockOutlined, UserOutlined} from "@ant-design/icons";

const {Title, Paragraph} = Typography;

export function SignIn() {
    const navigate = useNavigate();
    const {setAuthToken} = useContext(MainContext);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
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
                message.success("با موفقیت وارد شدید ", 3);
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            message.error("نام کاربری یا رمز عبور نادرست است");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="layout flex items-center justify-center p-8">

            <div
                className="grid gap-5 text-dark-text-primary"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    gridTemplateColumns: '1.5fr 1fr',
                    gridTemplateRows: 'auto auto',
                }}
            >


                <div
                    className="AeroBox flex flex-col justify-between"
                    style={{gridColumn: '1 / 2', gridRow: '1 / 3'}}
                >
                    <div>
                        <Title
                            level={2}
                            className="font-black"
                            style={{
                                color: 'var(--color-dark-text-primary)',
                                textShadow: '0 0 8px rgba(0, 212, 255, 0.5)'
                            }}
                        >
                            به داشبورد خوش آمدید
                        </Title>
                        <Paragraph className="text-lg text-dark-text-secondary mt-2">
                            برای ورود به سیستم نام کاربری و رمز عبور خود را وارد کنید
                        </Paragraph>
                    </div>


                </div>

                <div
                    className="AeroBox"
                    style={{gridColumn: '2 / 3', gridRow: '1 / 2'}}
                >
                    <Form
                        className="w-full"
                        onFinish={onFinish}
                        layout="vertical"
                        initialValues={{remember: true}}
                    >
                        <Form.Item
                            name="username"
                            label={<label className="text-sm font-medium text-dark-text-secondary">نام کاربری</label>}
                            rules={[{required: true, message: "لطفا نام کاربری خود را وارد کنید"}]}
                        >
                            <Input
                                size="large"
                                placeholder="نام کاربری"
                                prefix={<UserOutlined className="text-Neon-Primary"/>}
                                className="GlassInput"/>
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<label className="text-sm font-medium text-dark-text-secondary">رمزعبور</label>}
                            rules={[{required: true, message: "لطفا رمز عبور خود را وارد کنید"}]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="********"
                                prefix={<LockOutlined className="text-Neon-Primary"/>}
                                className="GlassInput"
                            />
                        </Form.Item>

                        <Form.Item className="mt-8">
                            <Button
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                                className="NeonButton"
                            >
                                ورود
                            </Button>
                        </Form.Item>

                    </Form>
                </div>

                <div
                    className="AeroBox flex flex-col justify-between"
                    style={{gridColumn: '2 / 3', gridRow: '2 / 3'}}
                >
                    <div className="flex flex-col space-y-4">
                        <Link to="/forget-password"
                              className="text-sm font-medium NeonText flex items-center">
                            <ArrowLeftOutlined className="ml-2"/> فراموشی رمز عبور
                        </Link>

                    </div>
                </div>

            </div>
        </section>
    );
}

export default SignIn;