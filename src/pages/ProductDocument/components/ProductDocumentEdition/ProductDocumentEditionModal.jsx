import { Col, Form, message, Row, Select } from "antd";
import Modal from "../../../../components/Modal";
import {
    useCreateProductDocumentEdition,
    useUpdateProductDocumentEdition,
    useProductDocumentTreeById
} from "@/QueryServises/productDocumentQuery/index.js";
import DatepickerCustom from "../../../../components/DatePicker";
import FileUploader from "../../../../components/FileUploader/FileUploader";
import { checkEditionDuplicate } from "@/utils/checkEditionDuplicate.js";

const ProductDocumentEditionModal = ({ isOpen, modalMode, modalData, closeModal, refetch, currentProduct }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProductDocumentEdition } = useCreateProductDocumentEdition();
    const { isPending: isUpdating, mutateAsync: updateProductDocumentEdition } = useUpdateProductDocumentEdition();

    const { refetch: refetchDocumentTree } = useProductDocumentTreeById(currentProduct?.id, {
        enabled: false
    });

    const onFinishForm = async (values) => {
        const payload = {
            product_document_id: modalData?.product_document_id?.id,
            edition: values.edition,
            survey_date: values.survey_date,
            state: 10,
            file_1: values.file_1?.[0]?.originFileObj,
            file_2: values.file_2?.[0]?.originFileObj,
            file_3: values.file_3?.[0]?.originFileObj,
            file_4: values.file_4?.[0]?.originFileObj,
        };

        try {
            if (modalMode === "edition") {
                await createProductDocumentEdition(payload);
                message.success("نسخه جدید با موفقیت اضافه شد");
            } else {
                await updateProductDocumentEdition({
                    documentId: modalData?.id,
                    ...payload,
                    product_document_id: modalData.product_document_id,
                });
                message.success("نسخه با موفقیت ویرایش شد");
            }
            refetch();
            closeModal();
        } catch (error) {
            const errorMessage = error.response?.data?.detail || "عملیات موفقیت آمیز نبود، دوباره امتحان کنید";
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
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Form.Item
                            label="نام نسخه"
                            name="edition"
                            rules={[
                                { required: true, message: "لطفا نام نسخه را انتخاب کنید" },
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();
                                        const { data: productDocument } = await refetchDocumentTree();
                                        console.log(productDocument);
                                        console.log(value);
                                        console.log(modalData?.id);

                                        const isEditionExist = checkEditionDuplicate(productDocument, value, modalData?.id);
                                        if (isEditionExist) {
                                            return Promise.reject(new Error("این نسخه قبلاً اضافه شده است"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Select
                                options={Array.from({ length: 26 }, (_, i) => ({
                                    value: String.fromCharCode(97 + i).toUpperCase(),
                                    label: String.fromCharCode(97 + i).toUpperCase(),
                                }))}
                                placeholder="انتخاب کنید"
                                disabled={modalMode !== "edition"}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="تاریخ بررسی" name="survey_date">
                            <DatepickerCustom format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="فایل 1" name="file_1">
                            <FileUploader maxCount={1} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="فایل 2" name="file_2">
                            <FileUploader maxCount={1} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="فایل 3" name="file_3">
                            <FileUploader maxCount={1} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="فایل 4" name="file_4">
                            <FileUploader maxCount={1} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductDocumentEditionModal;