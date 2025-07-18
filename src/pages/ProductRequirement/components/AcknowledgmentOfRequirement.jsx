import { Col, Form, Input, message, Row, Select } from 'antd';
import Modal from '../../../components/Modal'
import FileUploader from '../../../components/FileUploader/FileUploader';
import { useCreatepProductRequirementExported, useUpdateProductRequirementExported } from '../../../QueryServises/productRequirementQuery';
import { useProductList } from '../../../QueryServises/productQuery';
import { SearchOutlined } from '@ant-design/icons';

const AcknowledgmentOfRequirement = ({ isOpen, modalMode, modalData, closeModal, selectProduct, refetch }) => {
    const [form] = Form.useForm();

    const { mutateAsync: createProductRequirementExported } = useCreatepProductRequirementExported();
    const { mutateAsync: updateProductRequirementExported } = useUpdateProductRequirementExported();
    const { data: productList } = useProductList()

    const onFinish = async (values) => {
        const productRequirementId = modalData?.product_requirements[0]?.id

        const payload = {
            product_requirement_id: productRequirementId,
            to_product_id: values.to_product_id,
            pass_comment: values.pass_comment,
            // state: null,
            file_1: values.file_1?.[0]?.originFileObj,
        }
        try {
            if (modalMode === "add") {
                await createProductRequirementExported(payload);
                message.success("الزام با موفقیت اضافه شد");
                await refetch();

            } else {
                if (!modalData?.id) {
                    throw new Error("Missing product requirement ID for edit");
                }
                await updateProductRequirementExported({
                    productRequirementExportedId: modalData.id,
                    ...payload
                });
                message.success("الزام با موفقیت ویرایش شد");
                await refetch();
            }
            closeModal();
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = error.response?.data?.message
                || error.message
                || "موفقیت آمیز نبود، دوباره امتحان کنید";
            message.error(errorMessage);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "تصدیق"} الزام`}
            size={600}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
        >
            <Form layout='vertical' onFinish={onFinish} form={form}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item label="محصولات" name="to_product_id">
                            <Select options={productList?.map((item) => {
                                return (
                                    {
                                        value: item.id,
                                        label: item.persian_title
                                    }
                                )
                            })}
                                suffixIcon={<SearchOutlined />}
                                showSearch
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="توضیحات" name="pass_comment">
                            <Input.TextArea />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="فایل ضمیمه " name="file_1">
                            <FileUploader />
                        </Form.Item>
                    </Col>
                    {/* <Col span={12}>
                        <Form.Item label="فایل ضمیمه 2">
                            <FileUploader />
                        </Form.Item>
                    </Col> */}
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
