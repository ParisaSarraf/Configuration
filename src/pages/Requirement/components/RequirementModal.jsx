import { PlusOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, message, Row, Switch, TreeSelect } from "antd"
import Modal from "../../../components/Modal";
import { useCreateRequirement } from "../../../QueryServises/requirementQuery";

const RequirementModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct, refetch }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProductRequirement } = useCreateRequirement();


    const onFinishForm = async (values) => {
        const payload = {
            product_id: currentProduct.id,
            document_id: values.document_id,
            title: values.title,
            gant_doc: values.gant_doc,
        };
        try {
            if (modalMode === "add") {
                await createProductRequirement(payload);
                message.success("سند با موفقیت اضافه شد");
                refetch()
            } else {
                // await updateProductDocument({ documentId: modalData.id, ...payload });
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
        <>
            <Button
                className="modal-button"
                icon={<PlusOutlined className="text-center" />}
                onClick={() => setModal({ mode: "add", data: null })}
            >
                <span className="xs:hidden sm:hidden md:inline">افزودن الزامات</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} الزامات`}
                size={600}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
            // loading={isCreating || isUpdating}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishForm}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                label="کد"
                                name="code"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="والد"
                                name="parent_id"
                                rules={[{ required: true, message: "لطفاً والد را انتخاب کنید" }]}
                            >
                                <TreeSelect
                                    // treeData={getTreeSelectOptions(documentList || [])}
                                    placeholder="والد"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="نام فارسی"
                                name="persianTitle"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="نام انگلیسی"
                                name="englishTitle"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="چرخه حیات"
                                name="life_cycle_id"
                                rules={[{ required: true, message: "لطفاً چرخه حیات را انتخاب کنید" }]}
                            >
                                <TreeSelect
                                    // treeData={getTreeSelectOptions(documentList || [])}
                                    placeholder="چرخه حیات"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>


                        <Col span={12}>
                            <Form.Item
                                label="قابل تعریف است"
                                name="is_definable"
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
    )
}

export default RequirementModal
