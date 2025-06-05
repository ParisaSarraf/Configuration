import { PlusOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, message, Row, Select } from "antd"
import Modal from "../../../components/Modal";
import FileUploader from "../../../components/FileUploader/FileUploader";
import { useCreateExperience, useUpdateExperience } from "../../../QueryServises/experienceQuery";
import { usePrecinctProductList } from "../../../QueryServises/precinctQuery";
import { useEffect } from "react";
import { BASEURL } from "../../../Services/axiosInstance";


const ExperienceModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct, refetch }) => {
    const { mutateAsync: createExperience } = useCreateExperience()
    const { mutateAsync: updateExperience } = useUpdateExperience()
    const { data: precinctData } = usePrecinctProductList()
    const [form] = Form.useForm();


    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                precinct_id: modalData?.precinct?.id,
                experiment_text: modalData?.experiment_text,
                file: modalData.file
                    ? [
                        {
                            uid: "-1",
                            name: "file",
                            url: BASEURL.replace("/api/v1", "") + modalData.file,
                        },
                    ]
                    : [],
            });
        } else {
            form.resetFields();
        }
    }, [form, modalMode, modalData]);


    const onFinish = async (values) => {
        const payload = {
            product_id: currentProduct?.id,
            precinct_id: values.precinct_id,
            experiment_text: values.experiment_text,
            code: values.code,
            registration_date: values.registration_date,
            user: values.user,
            file: values.file?.[0]?.originFileObj,
        }
        try {
            if (modalMode === 'edit') {
                await updateExperience({ ExperienceId: modalData?.id, ...payload })
                message.success("تجربه با موفقیت ویرایش شد.")
            } else {
                await createExperience(payload)
                message.success("تجربه با موفقیت اضافه شد.")
            }
            closeModal();
            await refetch()
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
            />
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
                            <Form.Item label="متن تجربه" name="experiment_text">
                                <Input.TextArea />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="فایل پیوست" name="file">
                                <FileUploader
                                    listType="picture"
                                />
                            </Form.Item>
                        </Col>

                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default ExperienceModal