import Modal from "@/components/Modal/index.jsx";
import {Col, Form, message, Row} from "antd";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import {
    useCreateProductDocumentEdition,
    useUpdateProductDocumentEdition
} from "@/QueryServises/productDocumentQuery/index.js";
import {useEffect} from "react";
import {BASEURL} from "@/Services/axiosInstance.js";

const ProductDocumentEditionFiles = ({
                                         isOpen,
                                         modalMode,
                                         modalData,
                                         closeModal,
                                         refetch,
                                         currentProduct
                                     }) => {
    const [form] = Form.useForm();

    const {isPending: isUpdating, mutateAsync: updateProductDocumentEdition} =
        useUpdateProductDocumentEdition();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                edition: modalData?.edition,
                file_1: modalData.file_1 ? [{
                    uid: "-1",
                    name: "file_1",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_1,
                }] : [],
                file_2: modalData.file_2 ? [{
                    uid: "-1",
                    name: "file_2",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_2,
                }] : [],
                file_3: modalData.file_3 ? [{
                    uid: "-1",
                    name: "file_3",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_3,
                }] : [],
                file_4: modalData.file_4 ? [{
                    uid: "-1",
                    name: "file_4",
                    url: BASEURL.replace("/api/v1", "") + modalData.file_4,
                }] : [],
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
            file_1: values.file_1?.[0]?.originFileObj,
            file_2: values.file_2?.[0]?.originFileObj,
            file_3: values.file_3?.[0]?.originFileObj,
            file_4: values.file_4?.[0]?.originFileObj,
            description: values.description
        };

        try {
            await updateProductDocumentEdition({
                documentId: modalData?.id,
                ...payload
            });
            message.success("نسخه با موفقیت ویرایش شد");
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
            title={`${modalMode === "edit" && "افزودن"} فایل`}
            size={700}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
            loading={isUpdating}
            footer={true}

        >
            <Form form={form} layout="vertical" onFinish={onFinishForm}>
                <Row gutter={16}>

                    <Col span={6}>
                        <Form.Item label={'فایل غیرقابل ویرایش'} name='file_1'>
                            <FileUploader maxCount={1}/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={'قابل ویرایش'} name='file_2'>
                            <FileUploader maxCount={1}/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={'فایل پشتیبان تولید'} name='file_3'>
                            <FileUploader maxCount={1}/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={'ارسال به کارفرما/پیمانکار'} name='file_4'>
                            <FileUploader maxCount={1}/>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}


export default ProductDocumentEditionFiles;