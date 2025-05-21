import { useEffect } from "react";
import { Button, Col, Form, Input, message, Row, Switch, TreeSelect } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment/moment";
import Modal from "../../../../components/Modal";
import { useCreateProductDocument, useUpdateProductDocument } from "../../../../QueryServises/productDocumentQuery";
import { useDocumentList } from "../../../../QueryServises/documentQuery";
import DatepickerCustom from "../../../../components/DatePicker";
import { useProductById } from "../../../../QueryServises/productQuery";

const ProductDocumentEditionModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProductDocument } = useCreateProductDocument();
    const { isPending: isUpdating, mutateAsync: updateProductDocument } = useUpdateProductDocument();
    const { data: documentList } = useDocumentList();
    const selectedProductId = currentProduct?.productData?.id
    const { refetch } = useProductById(selectedProductId);

    console.log('hi');


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
            file_1: values.is_reportable,
            file_2: values.is_reportable,
            file_3: values.is_reportable,
            file_4: values.is_reportable,
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
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
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
                            label=" قابل گزارش است"
                            name="is_reportable"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="بله"
                                unCheckedChildren="خیر"
                                className="bg-gray-300"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductDocumentEditionModal;
