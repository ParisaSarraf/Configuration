import { useEffect } from "react";
import { Button, Col, Form, Input, message, Row, Switch, TreeSelect } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment/moment";
import Modal from "../../../../components/Modal";
import { useCreateProductDocument, useUpdateProductDocument } from "../../../../QueryServises/productDocumentQuery";
import { useDocumentList } from "../../../../QueryServises/documentQuery";
import DatepickerCustom from "../../../../components/DatePicker";
import { useProductById } from "../../../../QueryServises/productQuery";
import FileUploader from "../../../../components/FileUploader/FileUploader";

const ProductDocumentEditionModal = ({ isOpen, modalMode, modalData, closeModal, currentProduct }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProductDocument } = useCreateProductDocument();
    const { isPending: isUpdating, mutateAsync: updateProductDocument } = useUpdateProductDocument();
    const selectedProductId = currentProduct?.productData?.id
    const { refetch } = useProductById(selectedProductId);


    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                is_reportable: modalData.is_reportable,
                title: modalData.title,
                document_id: modalData.document?.id,
                survey_date: modalData.survey_date ? moment(modalData.survey_date) : null,
            });

        } else if (modalMode === "add") {
            form.setFieldsValue({
                is_reportable: false,
                survey_date: null
            });
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            product_document_id: currentProduct.id,
            edition: values.document_id,
            survey_date: values.survey_date?.format
                ? values.survey_date.format("YYYY-MM-DD")
                : null,
            state: values.is_reportable,
            file_1:
                values.file_1 && values.file_1.length > 0
                    ? values.file_1[0].originFileObj
                    : null,
            file_2:
                values.file_2 && values.file_2.length > 0
                    ? values.file_2[0].originFileObj
                    : null,
            file_3:
                values.file_3 && values.file_3.length > 0
                    ? values.file_3[0].originFileObj
                    : null,
            file_4:
                values.file_4 && values.file_4.length > 0
                    ? values.file_4[0].originFileObj
                    : null,
        };
        try {
            if (modalMode === "add") {
                await createProductDocument(payload);
                message.success("سند با موفقیت اضافه شد");
                refetch()
            } else {
                await updateProductDocument({ documentId: modalData.id, ...payload });
                message.success("سند با موفقیت ویرایش شد");
                refetch()
            }
            refetch();
            closeModal();
        } catch (error) {
            message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
            console.error("Error details:", error.response?.data);
        }
    };



    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edition" ? "افزودن" : "ویرایش"} نسخه جدید`}
            size={500}
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
                <Row gutter={[16, 16]}>

                    <Col span={12}>
                        <Form.Item
                            label="تاریخ بررسی"
                            name="survey_date"
                        >
                            <DatepickerCustom format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="نسخه جدید"
                            name="edition"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="حالت "
                            name="state"
                        >
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="فایل 1"
                            name="file_1"
                        >
                            <FileUploader />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label=" فایل 2"
                            name="file_2"
                        >
                            <FileUploader />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="فایل 3"
                            name="file_3"
                        >
                            <FileUploader />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label=" فایل 4"
                            name="file_4"
                        >
                            <FileUploader />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductDocumentEditionModal;
