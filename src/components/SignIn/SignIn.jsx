import { Form, Input, Button, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export function SignIn() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/")   
    }


    return (
        <section className="m-8 flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Title level={2} className="font-bold mb-4">ورود </Title>
                    <Paragraph className="text-gray-600 text-lg">
                        لطفا رمز عبور و نام کاربری خود را وارد کنید
                    </Paragraph>
                </div>

                <Form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                    <Form.Item>
                        <Text strong className="block mb-2">نام کاربری</Text>
                        <Input
                            size="large"
                            placeholder="پریسا"
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Text strong className="block mb-2">رمزعبور</Text>
                        <Input.Password
                            size="large"
                            placeholder="********"
                            className="w-full"
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" onClick={handleLogin}>
                        ورود
                    </Button>

                    <div className="flex justify-between items-center mt-6">
                        <Button type='text' className="text-gray-900 hover:text-gray-600">
                            فراموشی رمز
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
                    src="src\assets\img\pattern.webp"
                    className="h-full w-full object-cover rounded-3xl"
                    alt="Background pattern"
                />
            </div>
        </section>
    );
}

export default SignIn;