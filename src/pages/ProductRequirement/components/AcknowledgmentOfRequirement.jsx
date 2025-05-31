import { Col, Form, Input, Row } from 'antd';
import Modal from '../../../components/Modal'
import FileUploader from '../../../components/FileUploader/FileUploader';

const AcknowledgmentOfRequirement = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    console.log(modalMode);

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "تصدیق"} الزام`}
            size={600}
            onClose={closeModal}
            // onSubmit={() => form.submit()}
            mode={modalMode}
        // loading={isCreating || isUpdating}
        >
            <Form layout='vertical'>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item label="توضیحات">
                            <Input.TextArea />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="فایل ضمیمه 1">
                            <FileUploader />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="فایل ضمیمه 2">
                            <FileUploader />
                        </Form.Item>
                    </Col>
                    {/* <Col span={24}>
                        <Form.Item label="توضیحات">
                            <Input.TextArea />
                        </Form.Item>
                    </Col> */}
                </Row>
            </Form>

        </Modal>
    )
}

export default AcknowledgmentOfRequirement
