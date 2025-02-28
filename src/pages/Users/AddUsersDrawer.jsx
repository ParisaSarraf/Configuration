import React from "react";
import { Drawer, Button, Space, Form, Input } from "antd";
import FileUploader from "../../components/FileUploader/FileUploader";

const AddUsersDrawer = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();

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
            footer={
                <Space>
                    <Button onClick={handleSubmit} type="primary">
                        تایید
                    </Button>
                    <Button onClick={onClose}>لغو</Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="avatar" className="flex flex-row w-full justify-center">
                    <FileUploader />
                </Form.Item>
                <Form.Item name="avatar">
                    <Input />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default AddUsersDrawer;