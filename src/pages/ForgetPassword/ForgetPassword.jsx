import { Form, Input, Button } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import Title from 'antd/es/typography/Title';
import { Link } from 'react-router-dom';


const ForgetPassword = () => {
    return (
        <section className="m-8 flex gap-4">
            <div className="w-2/5 h-full hidden lg:block">
                <img
                    src="assets/img/pattern.webp"
                    className="h-full w-full object-cover rounded-3xl"
                    alt="Background pattern"
                />
            </div>
            <div className="w-full lg:w-3/5 mt-24">
            
                <div className="text-center">
                    <Title level={2} className="font-bold mb-4">تغییر رمز عبور</Title>
                    <Paragraph className="text-gray-600 text-lg">
                        لطفا رمز عبور خود را تغییر دهید.
                    </Paragraph>
                </div>

                <Form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"  layout='vertical'>
                    <Form.Item
                        name="previousPassword"
                        label="رمز عبور قبلی"
                        rules={[{ required: true, message: 'لطفا نام کاربری خود را وارد کنید' }]}
                    >
                        <Input
                            size="large"
                            placeholder="رمز عبور قبلی"
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="رمز عبور جدید"
                        rules={[{ required: true, message: 'لطفا رمز عبور خود را وارد کنید' }]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="********"
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item
                        name="reapetNewPassword"
                        label="  تکرار رمز عبور جدید"
                        rules={[{ required: true, message: 'لطفا رمز عبور خود را وارد کنید' }]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="********"
                            className="w-full"
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large">
                        تغییر رمز عبور
                    </Button>
                </Form>
            </div>

            
        </section>
    )
}

export default ForgetPassword
