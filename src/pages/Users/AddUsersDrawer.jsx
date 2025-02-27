import React from "react";
import { Drawer, Button, Space, Form, Input } from "antd";
import FileUploader from "../../components/FileUploader/FileUploader";

const AddUsersDrawer = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();

    const formFields = [
        {
            name: "username",
            component: <FileUploader />,
        },
        {
            label: "نام کاربری",
            name: "username",
            rules: [{ required: true, message: "لطفاً نام کاربری را وارد کنید!" }],
            component: <Input />,
        },
        {
            label: "ایمیل",
            name: "email",
            rules: [
                { required: true, message: "لطفاً ایمیل را وارد کنید!" },
                { type: "email", message: "ایمیل معتبر نیست!" },
            ],
            component: <Input type="email" />,
        },
        {
            label: "رمز عبور",
            name: "password",
            rules: [{ required: true, message: "لطفاً رمز عبور را وارد کنید!" }],
            component: <Input.Password />,
        },
    ];

    const handleSubmit = () => {
        form
            .validateFields()
            .then((values) => {
                onSubmit(values);
                form.resetFields();
                onClose();
            })
            .catch((error) => {
                console.error("Validation Failed:", error);
            });
    };

    return (
        <Drawer
            title="کاربر جدید"
            width={400}
            placement={"left"}
            onClose={onClose}
            open={visible}
            extra={
                <Space>
                    <Button onClick={handleSubmit} type="primary">
                        تایید
                    </Button>
                    <Button onClick={onClose}>لغو</Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {formFields.map((field, index) => (
                    <Form.Item
                        key={index}
                        label={field.label}
                        name={field.name}
                        rules={field.rules}
                    >
                        {field.component}
                    </Form.Item>
                ))}
            </Form>
        </Drawer>
    );
};

export default AddUsersDrawer;