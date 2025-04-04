import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Row, Select, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDocumentList } from "../../../QueryServises/documentQuery";
import { useCreateProductDocument, useUpdateProductDocument } from "../../../QueryServises/productDocumentQuery";

const DocumentProductModal = ({ isOpen, modalMode, modalData, closeModal, setModal }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProductDocument } = useCreateProductDocument();
    const { isPending: isUpdating, mutateAsync: updateProductDocument } = useUpdateProductDocument();
    const { data: documentList, refetch } = useDocumentList();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                code: modalData.code,
                persianTitle: modalData.persianTitle,
                englishTitle: modalData.englishTitle,
                isUsable: modalData.isUsable,
                isReproducible: modalData.isReproducible,
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            product_id: values.code,
            document_id: values.persianTitle,
            title: values.englishTitle,
            gant_doc: values.isUsable,
        };

        try {
            if (modalMode === "add") {
                await createProductDocument(payload);
                message.success("سند با موفقیت اضافه شد");
            } else {
                await updateProductDocument({ documentId: modalData.id, ...payload });
                message.success("سند با موفقیت ویرایش شد");
            }
            await refetch();
            closeModal();
        } catch (error) {
            message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
            console.error("Error details:", error.response?.data);
        }
    };

    return (
        <>
            <Button
                className="modal-button"
                icon={<PlusOutlined className="text-center" />}
                onClick={() => setModal({ mode: "add", data: null })}
            >
                <span className="xs:hidden sm:hidden md:inline">افزودن سند</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
                size={300}
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
                        <Col span={24}>
                            <Form.Item
                                label="نام"
                                name="title"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="اسناد"
                                name="document_id"
                                rules={[{ required: true, message: "لطفاً اسناد را انتخاب کنید" }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="اسناد"
                                    options={documentList?.map(document => ({
                                        label: `${document.persianTitle}`,
                                        value: document.id
                                    }))}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>



                        <Col span={16}>
                            <Form.Item
                                label="دارای گانت"
                                name="gant_doc"
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
