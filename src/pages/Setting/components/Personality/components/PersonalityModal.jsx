import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import { useCreatePersonalityProduct, usePersonalityProductList, useUpdatePesonalityProduct } from "../../../../../QueryServises/personalityQuery";

const PersonalityModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const { data: personalityList, isFetching: isFetchingPersonality } = usePersonalityProductList();
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createPersonality } = useCreatePersonalityProduct();
    const { isPending: isUpdating, mutateAsync: updatePersonality } = useUpdatePesonalityProduct();

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
            ...(values.parent_id !== undefined && { parent_id: values.parent_id })
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
                personalityId: modalData.id,
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

    const getParentOptions = () => {
        if (!personalityList) return [];

        const flattenPersonalityList = (items) => {
            let result = [];
            items.forEach(item => {
                result.push({
                    id: item.id,
                    name: item.name,
                    parent: item.parent
                });
                if (item.children && item.children.length > 0) {
                    result = result.concat(flattenPersonalityList(item.children));
                }
            });
            return result;
        };

        const allPersonality = flattenPersonalityList(personalityList);
        return allPersonality
            .filter(personality => {
                if (modalMode !== "edit") return true;

                if (personality.id === modalData?.id) return false;

                const isChildOfCurrent = (items, parentId) => {
                    return items.some(item => {
                        if (item.id === parentId) return true;
                        if (item.children && item.children.length > 0) {
                            return isChildOfCurrent(item.children, parentId);
                        }
                        return false;
                    });
                };

                return !isChildOfCurrent(personalityList, modalData?.id);
            })
            .map(personality => ({
                label: personality.name,
                value: personality.id
            }));
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
                            <Col span={24}>
                                <Form.Item
                                    name="parent_id"
                                    label="هویت والد (اختیاری)"
                                >
                                    <Select
                                        placeholder="انتخاب هویت والد"
                                        loading={isFetchingPersonality}
                                        allowClear
                                        options={getParentOptions()}
                                    />
                                </Form.Item>
                            </Col>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default PersonalityModal;