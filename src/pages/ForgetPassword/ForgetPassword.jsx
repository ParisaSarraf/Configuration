import {Button, Form, Input, message, Typography} from 'antd';
import {Link, useNavigate} from 'react-router-dom';
import {useChangePassword} from '../../QueryServises/forgetPassQuery';
import {ArrowLeftOutlined, LockOutlined, SafetyCertificateOutlined} from '@ant-design/icons'; // آیکون‌های لازم

const {Title, Paragraph} = Typography;

export function ForgetPassword() {
    const navigate = useNavigate();
    const {mutateAsync: changePass, isLoading: isChanging} = useChangePassword();

    const onFinish = async (values) => {
        if (values.newPassword !== values.reapetNewPassword) {
            message.error("رمز عبور جدید و تکرار آن یکسان نیستند.");
            return;
        }

        const payload = {
            old_password: values.previousPassword,
            new_password: values.newPassword
        };
        try {
            await changePass(payload);
            message.success('رمزعبور با موفقیت تغییر کرد');
            navigate('/sign-in');
        } catch (error) {
            console.error(error);
            message.error("مشکلی در تغییر رمزعبور پیش آمده است. (لطفا رمز عبور قبلی را بررسی کنید.)");
        }
    };


    const neonColor = 'text-Neon-Primary';

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
                                textShadow: '0 0 8px rgba(195, 123, 245, 0.6)'
                            }}
                        >
                            تغییر رمز عبور سیستم
                        </Title>
                        <Paragraph className="text-lg text-dark-text-secondary mt-2">
                            لطفاً برای حفظ امنیت، رمز عبور خود را به صورت منظم تغییر دهید.
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
                    >
                        <Form.Item
                            name="previousPassword"
                            label={<label className="text-sm font-medium text-dark-text-secondary">رمز عبور
                                قبلی</label>}
                            rules={[{required: true, message: 'لطفا رمز عبور قبلی را وارد کنید'}]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="رمز عبور قبلی"
                                prefix={<LockOutlined className={neonColor}/>}
                                className="GlassInput"
                            />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label={<label className="text-sm font-medium text-dark-text-secondary">رمز عبور
                                جدید</label>}
                            rules={[{required: true, message: 'لطفا رمز عبور جدید را وارد کنید'}]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="رمز عبور جدید"
                                prefix={<SafetyCertificateOutlined className={neonColor}/>}
                                className="GlassInput"
                            />
                        </Form.Item>

                        <Form.Item
                            name="reapetNewPassword"
                            label={<label className="text-sm font-medium text-dark-text-secondary">تکرار رمز عبور
                                جدید</label>}
                            rules={[{required: true, message: 'لطفا تکرار رمز عبور جدید را وارد کنید'}]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="تکرار رمز عبور جدید"
                                prefix={<SafetyCertificateOutlined className={neonColor}/>}
                                className="GlassInput"
                            />
                        </Form.Item>

                        <Form.Item className="mt-8">
                            <Button
                                htmlType="submit"
                                block
                                size="large"
                                loading={isChanging}
                                className="NeonButton"
                            >
                                {isChanging ? "" : "تغییر رمز عبور"}
                            </Button>
                        </Form.Item>

                    </Form>
                </div>

                <div
                    className="AeroBox flex flex-col justify-between"
                    style={{gridColumn: '2 / 3', gridRow: '2 / 3'}}
                >
                    <div className="flex flex-col space-y-4">
                        <Link to="/sign-in"
                              className="text-sm font-medium NeonText flex items-center">
                            <ArrowLeftOutlined className="ml-2"/> بازگشت به صفحه ورود
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default ForgetPassword;