import { PlusOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, message, Row, Switch, TreeSelect } from "antd"
import Modal from "../../../components/Modal";
import { useCreateRequirement, useRequirementList, useUpdateRequirement } from "../../../QueryServises/requirementQuery";
import { useLifeCycleList } from "../../../QueryServises/lifeCycleQuery";
import { useEffect } from "react";

const RequirementModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct, refetch }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProductRequirement } = useCreateRequirement();
    const { isPending: isUpdating, mutateAsync: updateProductRequirement } = useUpdateRequirement();
    const { data: requirementList } = useRequirementList()
    const { data: lifeCycleList } = useLifeCycleList()

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                parent_id: modalData.parent_id?.id,
                code: modalData.code,
                persianTitle: modalData.persian_title || modalData.title,
                englishTitle: modalData.english_title || modalData.englishTitle,
                life_cycle_id: modalData.life_cycle?.id,
                is_definable: modalData.is_definable || false,
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            life_cycle_id: values.life_cycle_id || null,
            parent_id: values.parent_id || null,
            code: values.code,
            persian_title: values.persianTitle,
            english_title: values.englishTitle,
            is_definable: values.is_definable,
        };
        try {
            if (modalMode === "add") {
                await createProductRequirement(payload);
                message.success("الزام با موفقیت اضافه شد");
                refetch()
            } else {
                await updateProductRequirement({ requirementId: modalData.id, ...payload });
                message.success("الزام با موفقیت ویرایش شد");
                refetch()
            }
            refetch();
            closeModal();
        } catch (error) {
            message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
            console.error("Error details:", error.response?.data);
        }
    };

    const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
        return data.map(item => {
            const titleFields = [
                'persian_title',
                'title'
            ];
            let title = 'بدون عنوان';
            for (const field of titleFields) {
                if (item[field]) {
                    title = item[field];
                    if (field !== 'code' && item.code) {
                        title = ` ${title}`;
                    }
                    break;
                }
            }
            return {
                title: title,
                value: item.id,
                children: item.children ? getTreeSelectOptions(item.children, modalMode, modalData) : [],
                // disabled: modalMode === "edit" && item.id === modalData?.document?.id 
            };
        });
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
                                label="کد"
                                name="code"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="والد"
                                name="parent_id"
                            >
                                <TreeSelect
                                    treeData={getTreeSelectOptions(requirementList || [])}
                                    placeholder="شاخه والد"
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
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="نام انگلیسی"
                                name="englishTitle"
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="چرخه حیات"
                                name="life_cycle_id"
                            >
                                <TreeSelect
                                    treeData={getTreeSelectOptions(lifeCycleList || [])}
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
