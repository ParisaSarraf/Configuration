import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import { useCreateCoreSetting, useUpdateCoreSetting } from "../../../../../QueryServises/settingQuery";

const PersonalityModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createPersonality } = useCreateCoreSetting();
    const { isPending: isUpdating, mutateAsync: updatePersonality } = useUpdateCoreSetting();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData.name,
                type: modalData.type || "personality"
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = (values) => {
        if (!values.name) {
            message.error("لطفاً نام هویت را وارد کنید");
            return;
        }

        const payload = {
            name: values.name,
            type: "personality"
        };

        if (modalMode === "add") {
            createPersonality(payload)
                .then(() => {
                    message.success("هویت با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("خطا در اضافه کردن هویت");
                    console.error("Create error:", error);
                });
        } else if (modalMode === "edit") {
            if (!modalData?.id) {
                message.error("شناسه هویت برای ویرایش یافت نشد");
                return;
            }
            updatePersonality({
                id: modalData.id,
                ...payload
            })
                .then(() => {
                    message.success("هویت با موفقیت ویرایش شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("خطا در ویرایش هویت");
                    console.error("Update error:", error.response?.data || error);
                });
        }
    };

    return (
        <>
            <Button
                className="modal-button"
                icon={<PlusOutlined className="text-center" />}
                onClick={() => setModal({ mode: "add", data: null })}
            >
                <span className="xs:hidden sm:hidden md:inline">افزودن هویت</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} هویت`}
                size={600}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
                loading={isCreating || isUpdating}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishForm}
                    initialValues={{
                        type: "personality"
                    }}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="هویت"
                                rules={[{
                                    required: true,
                                    message: "لطفاً نام هویت را وارد کنید"
                                }]}
                            >
                                <Input placeholder="نام هویت" />
                            </Form.Item>
                            <Form.Item name="type" hidden>
                                <Input type="hidden" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default PersonalityModal;