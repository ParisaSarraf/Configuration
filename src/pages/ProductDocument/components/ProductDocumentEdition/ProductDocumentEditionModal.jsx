import { Col, Form, Input, message, Row, Select } from "antd";
import Modal from "../../../../components/Modal";
import {
    useCreateProductDocumentEdition,
    useUpdateProductDocumentEdition,
    useProductDocumentTreeById
} from "@/QueryServises/productDocumentQuery/index.js";
import { checkEditionDuplicate } from "@/utils/checkEditionDuplicate.js";
import { useEffect } from "react";

const ProductDocumentEditionModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
    refetch,
    currentProduct
}) => {
    const [form] = Form.useForm();

    const { isPending: isCreating, mutateAsync: createProductDocumentEdition } =
        useCreateProductDocumentEdition();
    const { isPending: isUpdating, mutateAsync: updateProductDocumentEdition } =
        useUpdateProductDocumentEdition();

    const { refetch: refetchDocumentTree } = useProductDocumentTreeById(
        currentProduct?.id,
        { enabled: false }
    );

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                edition: modalData?.edition,
                description: modalData?.description
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            product_document_id: modalData?.product_document_id?.id || currentProduct?.id,
            edition: values.edition,
            description: values.description
        };

        try {
            if (modalMode === "edition") {
                await createProductDocumentEdition(payload);
                message.success("نسخه جدید با موفقیت اضافه شد");
            } else {
                await updateProductDocumentEdition({
                    documentId: modalData?.id,
                    ...payload
                });
                message.success("نسخه با موفقیت ویرایش شد");
            }
            refetch();
            closeModal();
        } catch (error) {
            const errorMessage =
                error.response?.data?.detail ||
                "عملیات موفقیت آمیز نبود، دوباره امتحان کنید";
            message.error(errorMessage);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edition" ? "افزودن" : "ویرایش"} نسخه`}
            size={700}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
            loading={isCreating || isUpdating}
        >
            <Form form={form} layout="vertical" onFinish={onFinishForm}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="نام نسخه"
                            name="edition"
                            rules={[
                                { required: true, message: "لطفا نام نسخه را انتخاب کنید" },
                                {
                                    validator: async (_, value) => {
                                        if (!value || modalMode === "edit") return Promise.resolve();
                                        const { data: productDocument } =
                                            await refetchDocumentTree();
                                        const isEditionExist = checkEditionDuplicate(
                                            productDocument,
                                            value,
                                            modalData?.id
                                        );
                                        if (isEditionExist)
                                            return Promise.reject(
                                                new Error("این نسخه قبلاً اضافه شده است")
                                            );
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Select
                                options={Array.from({ length: 26 }, (_, i) => ({
                                    value: String.fromCharCode(97 + i).toUpperCase(),
                                    label: String.fromCharCode(97 + i).toUpperCase()
                                }))}
                                placeholder="انتخاب کنید"
                                disabled={modalMode !== "edition"}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="توضیح" name="description">
                            <Input.TextArea placeholder="توضیحات نسخه را وارد کنید" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductDocumentEditionModal;
