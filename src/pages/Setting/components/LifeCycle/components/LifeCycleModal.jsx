
import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import {
    useCreatePersonalityProduct,
    usePersonalityProductList,
    useUpdatePesonalityProduct
} from "../../../../../QueryServises/personalityQuery";
import { useCreateLifeCycle, useUpdateLifeCycle } from "../../../../../QueryServises/lifeCycleQuery";

const LifeCycleModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
    setModal,
    refetch
}) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createLifeCycle } = useCreateLifeCycle();
    const { isPending: isUpdating, mutateAsync: updateLifeCycle } = useUpdateLifeCycle();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                title: modalData.title,
                tag: modalData.tag
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = (values) => {

        const payload = {
            title: values.title,
            tag: values.tag
        };

        if (modalMode === "add") {
            createLifeCycle(payload)
                .then(() => {
                    message.success("چرخه حیات محصول با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("خطا در اضافه کردن چرخه حیات محصول");
                    console.error("Create error:", error);
                });
        } else if (modalMode === "edit") {
            if (!modalData?.id) {
                message.error("شناسه چرخه حیات محصول برای ویرایش یافت نشد");
                return;
            }
            updateLifeCycle({
                lifeCycleId: modalData.id,
                ...payload
            })
                .then(() => {
                    message.success("چرخه حیات محصول با موفقیت ویرایش شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("خطا در ویرایش چرخه حیات محصول");
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
                <span className="xs:hidden sm:hidden md:inline">افزودن چرخه حیات محصول</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} چرخه حیات محصول`}
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
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="title"
                                label="چرخه حیات محصول"
                            >
                                <Input placeholder="نام چرخه حیات محصول" />
                            </Form.Item>
                            <Col span={24}>
                                <Form.Item
                                    name="tag"
                                    label="برچسب "
                                >
                                    <Input placeholder="برچسب" />

                                </Form.Item>
                            </Col>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default LifeCycleModal;