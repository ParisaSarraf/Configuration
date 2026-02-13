import {Col, Form, Input, message, Row, Select} from "antd";
import Modal from "../../../../components/Modal";
import {
    useCreateProductDocumentEdition,
    useUpdateProductDocumentEdition
} from "@/QueryServises/productDocumentQuery/index.js";
import {useEffect} from "react";
import {useReasonsEditingList} from "@/QueryServises/ReasonsEditingQuery/index.js";

const ProductDocumentEditionModal = (
    {
        isOpen,
        modalMode,
        modalData,
        closeModal,
        refetch,
        currentProduct
    }) => {
    const [form] = Form.useForm();

    const {data: ReasonsEditingData} = useReasonsEditingList()
    const {isPending: isCreating, mutateAsync: createProductDocumentEdition} =
        useCreateProductDocumentEdition();
    const {isPending: isUpdating, mutateAsync: updateProductDocumentEdition} =
        useUpdateProductDocumentEdition();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                edition: modalData?.edition,
                description: modalData?.description,
                reasons_editing_id: modalData?.reasons_editing,
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            product_document_id: modalData?.product_document_id?.id || currentProduct?.id,
            edition: values.edition,
            description: values.description,
            reasons_editing_id: values.reasons_editing_id,

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
            if (error.response) {
                const serverError = error.response.data;
                const errorMessage =
                    serverError.message ||
                    serverError.detail ||
                    (Array.isArray(serverError) ? serverError.join(', ') : 'خطایی در سرور رخ داده است');
                message.error(errorMessage);
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error('خطای نامشخصی رخ داده است');
            }
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
                <Row gutter={[16,2]}>
                    <Col span={12}>
                        <Form.Item label="نام نسخه" name="edition"
                                   rules={[{required: true, message: "لطفا نام نسخه را انتخاب کنید"}]}>
                            <Select
                                options={[
                                    {value: "0", label: "0"},
                                    ...Array.from({length: 26}, (_, i) => ({
                                        value: String.fromCharCode(65 + i),
                                        label: String.fromCharCode(65 + i)
                                    }))
                                ]}
                                placeholder="انتخاب کنید"
                                disabled={modalMode !== "edition"}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="دلایل ویرایش نسخه" name="reasons_editing_id">
                            <Select options={ReasonsEditingData?.map((reasonEdit) => {
                                return {
                                    value: reasonEdit.id,
                                    label: `${reasonEdit.name}`,
                                }
                            })}/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="توضیح" name="description">
                            <Input.TextArea placeholder="توضیحات نسخه را وارد کنید"/>
                        </Form.Item>
                    </Col>
                    {/*<Col span={6}>*/}
                    {/*    <Form.Item label={'فایل غیرقابل ویرایش'} name='file_1'>*/}
                    {/*        <FileUploader maxCount={1}/>*/}
                    {/*    </Form.Item>*/}
                    {/*</Col>*/}
                    {/*<Col span={6}>*/}
                    {/*    <Form.Item label={'قابل ویرایش'} name='file_2'>*/}
                    {/*        <FileUploader maxCount={1}/>*/}
                    {/*    </Form.Item>*/}
                    {/*</Col>*/}
                    {/*<Col span={6}>*/}
                    {/*    <Form.Item label={'فایل پشتیبان تولید'} name='file_3'>*/}
                    {/*        <FileUploader maxCount={1}/>*/}
                    {/*    </Form.Item>*/}
                    {/*</Col>*/}
                    {/*<Col span={6}>*/}
                    {/*    <Form.Item label={'ارسال به کارفرما/پیمانکار'} name='file_4'>*/}
                    {/*        <FileUploader maxCount={1}/>*/}
                    {/*    </Form.Item>*/}
                    {/*</Col>*/}
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductDocumentEditionModal;
