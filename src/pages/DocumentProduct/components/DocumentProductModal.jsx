import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Row, Switch, TreeSelect } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDocumentList } from "../../../QueryServises/documentQuery";
import { useCreateProductDocument, useUpdateProductDocument } from "../../../QueryServises/productDocumentQuery";
import { useProductById } from "../../../QueryServises/productQuery";
import DatepickerCustom from "../../../components/DatePicker";
import moment from "moment/moment";

const DocumentProductModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProductDocument } = useCreateProductDocument();
    const { isPending: isUpdating, mutateAsync: updateProductDocument } = useUpdateProductDocument();
    const { data: documentList } = useDocumentList();
    // console.log(documentList);

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
            form.resetFields()
            form.setFieldsValue({
                is_reportable: false,
                survey_date: null
            });
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            product_id: currentProduct.id,
            document_id: values.document_id,
            title: values.title,
            is_reportable: values.is_reportable || false,
            survey_date: values.survey_date?.format
                ? values.survey_date.format("YYYY-MM-DD")
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

    const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
        return data.map(item => {
            const titleFields = [
                'persianTitle',
            ];
            let title = 'بدون عنوان';
            for (const field of titleFields) {
                if (item[field]) {
                    title = item[field];
                    if (field !== 'code' && item.code) {
                        title = ` ${title}`;
                    }
                    break;
                }
            }
            return {
                title: title,
                value: item.id,
                children: item.children ? getTreeSelectOptions(item.children, modalMode, modalData) : [],
                disabled: modalMode === "edit" && item.id === modalData?.document?.id // اصلاح این خط
            };
        });
    };

    return (
        <>
            <Button
                icon={<PlusOutlined />}
                onClick={() => setModal({ mode: "add", data: null, type: 'AddDocumentProduct' })}
            >
            </Button>
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
                                label="عنوان سند"
                                name="title"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="نوع سند"
                                name="document_id"
                            // rules={[{ required: true, message: "لطفاً اسناد را انتخاب کنید" }]}
                            >
                                <TreeSelect
                                    treeData={getTreeSelectOptions(documentList || [])}
                                    placeholder="اسناد"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>

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
        </>
    );
};

export default DocumentProductModal;
