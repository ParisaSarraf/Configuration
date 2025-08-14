import {
    Col,
    Form,
    Input,
    message,
    Row,
    Select
} from "antd";
import Modal from "../../../../components/Modal";
import {
    useCreateProductDocumentEdition,
    useUpdateProductDocumentEdition
} from "@/QueryServises/productDocumentQuery/index.js";
import {useEffect} from "react";

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

    const {isPending: isCreating, mutateAsync: createProductDocumentEdition} =
        useCreateProductDocumentEdition();
    const {isPending: isUpdating, mutateAsync: updateProductDocumentEdition} =
        useUpdateProductDocumentEdition();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                edition: modalData?.edition,
                // file_1: modalData.file_1 ? [{
                //     uid: "-1",
                //     name: "file_1",
                //     url: BASEURL.replace("/api/v1", "") + modalData.file_1,
                // }] : [],
                // file_2: modalData.file_2 ? [{
                //     uid: "-1",
                //     name: "file_2",
                //     url: BASEURL.replace("/api/v1", "") + modalData.file_2,
                // }] : [],
                // file_3: modalData.file_3 ? [{
                //     uid: "-1",
                //     name: "file_3",
                //     url: BASEURL.replace("/api/v1", "") + modalData.file_3,
                // }] : [],
                // file_4: modalData.file_4 ? [{
                //     uid: "-1",
                //     name: "file_4",
                //     url: BASEURL.replace("/api/v1", "") + modalData.file_4,
                // }] : [],
                description: modalData?.description,
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            product_document_id: modalData?.product_document_id?.id || currentProduct?.id,
            edition: values.edition,
            // file_1: values.file_1?.[0]?.originFileObj,
            // file_2: values.file_2?.[0]?.originFileObj,
            // file_3: values.file_3?.[0]?.originFileObj,
            // file_4: values.file_4?.[0]?.originFileObj,
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
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="نام نسخه" name="edition"
                                   rules={[{required: true, message: "لطفا نام نسخه را انتخاب کنید"}]}>
                            <Select
                                options={Array.from({length: 26}, (_, i) => ({
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
