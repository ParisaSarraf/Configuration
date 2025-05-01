import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Row, Switch, TreeSelect } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDocumentList } from "../../../QueryServises/documentQuery";
import { useCreateProductDocument, useUpdateProductDocument } from "../../../QueryServises/productDocumentQuery";

const DocumentProductModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    // console.log(currentProduct.id);

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
            product_id: currentProduct.id,
            document_id: values.document_id,
            title: values.title,
            gant_doc: values.gant_doc,
        };
        try {
            if (modalMode === "add") {
                await createProductDocument(payload);
                message.success("سند با موفقیت اضافه شد");
            } else {
                await updateProductDocument({ documentId: modalData.id, ...payload });
                message.success("سند با موفقیت ویرایش شد");
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
                disabled: modalMode === "edit" && modalData && (item.id === modalData.id || item.id === modalData.parent_code)
            }
            return {
                title: title,
                value: item.id,
                children: item.children ? getTreeSelectOptions(item.children, modalMode, modalData) : [],
                disabled: modalMode === "edit" && item.id === modalData?.id
            };
        });
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
                                label="عنوان سند"
                                name="title"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="نوع سند"
                                name="document_id"
                                rules={[{ required: true, message: "لطفاً اسناد را انتخاب کنید" }]}
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
