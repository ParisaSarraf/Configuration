import { useEffect } from "react";
import { Col, Form, Input, message, Row, TreeSelect } from "antd";
import Modal from "../../../../../../components/Modal";
import { usePersonalityProductList } from "../../../../../../QueryServises/personalityQuery";
import { useCreateStandardCode, useUpdateStandardCode } from "../../../../../../QueryServises/StandardCodeQuery";
import TS from "../../../../../../components/TreeSelect";


const StandardCodeModal = ({ isOpen, modalMode, modalData, closeModal, setModal, standardRefetch }) => {
    const [form] = Form.useForm();
    const { data: personalityList, isFetching: isFetchingPersonality } = usePersonalityProductList();
    const { isPending: isCreating, mutateAsync: createStandardCode } = useCreateStandardCode();
    const { isPending: isUpdating, mutateAsync: updateStandardCode } = useUpdateStandardCode();


    console.log(modalData)
    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData.name,
                personality: modalData.id
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = (values) => {
        if (!values.name) {
            message.error("لطفاً نام هویت را وارد کنید");
            return;
        }
        const payload = {
            name: values.name,
            personality: values.personality

        };
        console.log(payload);

        if (modalMode === "add") {
            createStandardCode(payload)
                .then(() => {
                    message.success("هویت با موفقیت اضافه شد");
                    closeModal();
                    standardRefetch();
                })
                .catch((error) => {
                    message.error("خطا در اضافه کردن هویت");
                    console.error("Create error:", error);
                });
        } else if (modalMode === "edit") {
            if (!modalData?.id) {
                message.error("شناسه هویت برای ویرایش یافت نشد");
                return;
            }
            updateStandardCode({
                StandardCodeId: modalData.id,
                ...payload
            })
                .then(() => {
                    message.success("هویت با موفقیت ویرایش شد");
                    closeModal();
                    standardRefetch();
                })
                .catch((error) => {
                    message.error("خطا در ویرایش هویت");
                    console.error("Update error:", error.response?.data || error);
                });

        }
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"}  کد استاندارد`}
                size={400}
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
                                name="name"
                                label="کد استاندارد"
                                rules={[{
                                    required: true,
                                    message: "لطفاً کد استاندارد را وارد کنید"
                                }]}
                            >
                                <Input placeholder="کد استاندارد" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="personality"
                                label="هویت"
                            >
                                <TS
                                    data={personalityList}
                                    placeholder="هویت"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal >
        </>
    );
}

export default StandardCodeModal