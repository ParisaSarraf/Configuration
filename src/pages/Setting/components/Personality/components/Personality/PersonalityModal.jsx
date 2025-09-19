import {useEffect} from "react";
import {Col, Form, Input, message, Row, TreeSelect} from "antd";
import Modal from "../../../../../../components/Modal";
import {
    useCreatePersonalityProduct,
    usePersonalityProductList,
    useUpdatePesonalityProduct
} from "../../../../../../QueryServises/personalityQuery";

const PersonalityModal = ({isOpen, modalMode, modalData, closeModal, setModal, refetch}) => {
    const {data: personalityList, isFetching: isFetchingPersonality} = usePersonalityProductList();
    const [form] = Form.useForm();
    const {isPending: isCreating, mutateAsync: createPersonality} = useCreatePersonalityProduct();
    const {isPending: isUpdating, mutateAsync: updatePersonality} = useUpdatePesonalityProduct();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData.name,
                personality: modalData.personality,
                type: modalData.type || "personality"
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
            warehouse_code: values.warehouse_code,
            ...(values.parent_id !== undefined && {parent_id: values.parent_id})
        };

        if (modalMode === "add") {
            createPersonality(payload)
                .then(() => {
                    message.success("هویت با موفقیت اضافه شد");
                    closeModal();
                    refetch();
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
            updatePersonality({
                personalityId: modalData.id,
                ...payload
            })
                .then(() => {
                    message.success("هویت با موفقیت ویرایش شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("خطا در ویرایش هویت");
                    console.error("Update error:", error.response?.data || error);
                });
        }
    };

    const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
        return data.map(item => {
            const titleFields = [
                'persian_title',
                'title',
                'name',
                'label',
                'display_name',
                'code'
            ];
            let title = 'بدون عنوان';
            for (const field of titleFields) {
                if (item[field]) {
                    title = item[field];
                    if (field !== 'code' && item.code) {
                        title = `${item.code} - ${title}`;
                    }
                    break;
                }
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
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} هویت`}
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
                                label="هویت"
                                rules={[{
                                    required: true,
                                    message: "لطفاً نام هویت را وارد کنید"
                                }]}
                            >
                                <Input placeholder="نام هویت"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="warehouse_code"
                                label="کد انبار"
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="parent_id"
                                label="هویت والد (اختیاری)"
                            >
                                <TreeSelect
                                    treeData={getTreeSelectOptions(personalityList || [])}
                                    placeholder="هویت جایگزین"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default PersonalityModal;