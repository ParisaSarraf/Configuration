import {useEffect} from "react";
import {Col, Form, Input, message, Row} from "antd";
import Modal from "../../../../../../components/Modal";
import {usePersonalityProductList} from "@/QueryServises/personalityQuery/index.js";
import {useCreateStandardCode, useUpdateStandardCode} from "@/QueryServises/StandardCodeQuery/index.js";
import TS from "../../../../../../components/TreeSelect";
import FileUploader from "../../../../../../components/FileUploader/FileUploader";
import {BASEURL} from "@/Services/axiosInstance.js";


const StandardCodeModal = (
    {
        isOpen,
        modalMode,
        modalData,
        closeModal,
        standardRefetch,
        selectedPersonalityLabel,
        PersonalityId
    }) => {
    const [form] = Form.useForm();
    const {data: personalityList} = usePersonalityProductList();
    const {isPending: isCreating, mutateAsync: createStandardCode} = useCreateStandardCode();
    const {isPending: isUpdating, mutateAsync: updateStandardCode} = useUpdateStandardCode();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData?.name,
                personality: modalData?.parentData?.id,
                warehouse_code: modalData?.warehouse_code,
                description: modalData?.description,
                standard_file: modalData?.standard_file
                    ? [
                        {
                            uid: "-4",
                            name: "standard_file",
                            url: BASEURL.replace("/api/v1", "") + modalData?.standard_file,
                        },
                    ]
                    : [],
            });
        } else if (modalMode === "add") {
            form.resetFields();
            form.setFieldsValue({
                personality: PersonalityId
            });
        }
    }, [modalMode, modalData, form, PersonalityId]);

    const onFinishForm = (values) => {
        if (!values.name) {
            message.error("لطفاً نام هویت را وارد کنید");
            return;
        }

        const payload = {
            name: values.name,
            personality: modalMode === 'add' ? PersonalityId : values.personality,
            warehouse_code: values.warehouse_code,
            description: values.description,
            standard_file: values.standard_file?.[0]?.originFileObj,
        };

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
                size={700}
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
                                <Input placeholder="کد استاندارد"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="هویت"
                                name="personality"
                            >
                                <TS
                                    data={personalityList}
                                    placeholder="هویت"
                                    disabled={modalMode === 'add'}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="کد انبار"
                                name="warehouse_code"
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="description"
                                label="نام"
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="standard_file"
                                label="فایل ضمیمه"
                            >
                                <FileUploader/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}

export default StandardCodeModal;