import { PlusOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, Row, Select } from "antd"
import Modal from "../../../components/Modal";
import FileUploader from "../../../components/FileUploader/FileUploader";

const ExperienceModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    const [form] = Form.useForm();
    return (
        <>
            <Button
                className="modal-button"
                icon={<PlusOutlined />}
                onClick={() => setModal({ mode: "add", data: null, type: 'add' })}
            >
                افزودن تجربه جدید

            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} تجربه`}
                size={500}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
            // loading={isCreating || isUpdating}
            >
                <Form
                    form={form}
                    layout="vertical"
                // onFinish={onFinishForm}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item label="حوزه" name="">
                                <Select />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="متن تجربه" name="">
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="فایل پیوست" name="">
                                <FileUploader listType="picture" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default ExperienceModal
