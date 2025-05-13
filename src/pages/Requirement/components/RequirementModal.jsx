import { PlusOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, Modal, Row, Switch, TreeSelect } from "antd"

const RequirementModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    
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
                                label="نام فارسی"
                                name="persian_title"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="نام انگلیسی"
                                name="english_title"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="کد"
                                name="code"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
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
                        <Col span={24}>
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

                        <Col span={16}>
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
