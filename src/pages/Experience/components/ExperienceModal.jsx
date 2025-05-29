import { PlusOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, message, Row, Select } from "antd"
import Modal from "../../../components/Modal";
// import FileUploader from "../../../components/FileUploader/FileUploader";
import { useCreateExperience, useUpdateExperience } from "../../../QueryServises/experienceQuery";
import { usePrecinctProductList } from "../../../QueryServises/precinctQuery";
import { useEffect } from "react";


const ExperienceModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    const { mutateAsync: createExperience } = useCreateExperience()
    const { mutateAsync: updateExperience } = useUpdateExperience()
    const { data: precinctData } = usePrecinctProductList()
    const [form] = Form.useForm();

    useEffect(() => {
        if (modalMode === 'edit', modalData) {
            form.setFieldValue({
                precinct_id: modalData?.precinct_id,
                experience_text: modalData?.experiment_text,
                // files: modalData?.files (if you're handling file uploads)
            })
        }
    }, [form, modalMode, modalData])


    const onFinish = async (values) => {
        const payload = {
            product_id: currentProduct?.id,
            precinct_id: values.precinct_id,
            experiment_text: values.experience_text,
            // files: values.files (if you're handling file uploads)
        }
        try {
            if (modalData === 'edit') {
                updateExperience({ ExperienceId: modalData?.id, ...payload })
                message.success("تجربه با موفقیت ویرایش شد.")
            } else {
                createExperience(payload)
                message.success("تجربه با موفقیت اضافه شد.")
            }
            closeModal();
        } catch (error) {
            console.error("Error submitting form:", error);
            message.error("خطا در ثبت تجربه. لطفاً دوباره تلاش کنید.");
        }

    }

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
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item label="حوزه" name="precinct_id">
                                <Select
                                    options={precinctData ? precinctData.map(item => ({
                                        label: item.title,
                                        value: item.id
                                    })) : []}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="متن تجربه" name="experience_text">
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                        {/* <Col span={24}>
                            <Form.Item label="فایل پیوست" name="files">
                                <FileUploader
                                    listType="picture"
                                    // Make sure FileUploader properly handles file list
                                    fileList={form.getFieldValue('files') || []}
                                    onChange={(files) => form.setFieldsValue({ files })}
                                />
                            </Form.Item>
                        </Col> */}
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default ExperienceModal