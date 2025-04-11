import { useEffect } from "react";
import { Button, Col, Form, Input, message, Row, Select, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useCreatePrecinctProduct, usePrecinctProductList, useUpdatePrecinctProduct } from "../../../../../QueryServises/precinctQuery";
import { useLifeCycleList } from "../../../../../QueryServises/lifeCycleQuery";
import Modal from "../../../../../components/Modal";

const PrecinctModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const { data: PrecinctList, isFetching: isFetchingPrecinct } = usePrecinctProductList();
    const { isPending: isCreating, mutateAsync: createPrecinct } = useCreatePrecinctProduct();
    const { isPending: isUpdating, mutateAsync: updatePrecinct } = useUpdatePrecinctProduct();
    const { data: LifeCycleList } = useLifeCycleList();
    const [form] = Form.useForm();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                title: modalData.title,
                parent_id: modalData.parent_id || undefined,
                is_definable: Boolean(modalData.is_definable),
                life_cycle_id: modalData.life_cycle_id || undefined
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = (values) => {
        if (!values.title) {
            message.error("لطفاً نام حوزه را وارد کنید");
            return;
        }
        const payload = {
            life_cycle_id: values.life_cycle_id,
            title: values.title,
            is_definable: values.is_definable
        };
        if (values.parent_id) {
            payload.parent_id = values.parent_id;
        }

        if (modalMode === "add") {
            createPrecinct(payload)
                .then(() => {
                    message.success("حوزه با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("خطا در اضافه کردن حوزه");
                    console.error("Create error:", error);
                });
        } else if (modalMode === "edit") {
            if (!modalData?.id) {
                message.error("شناسه حوزه برای ویرایش یافت نشد");
                return;
            }
            updatePrecinct({
                PrecinctId: modalData.id,
                ...payload
            })
                .then(() => {
                    message.success("حوزه با موفقیت ویرایش شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("خطا در ویرایش حوزه");
                    console.error("Update error:", error.response?.data || error);
                });
        }
    };


    const getParentOptions = () => {
        if (!PrecinctList || PrecinctList.length === 0) {
            console.log('No PrecinctList available');
            return [];
        }

        const flattenPrecinctList = (items) => {
            let result = [];
            items.forEach(item => {
                result.push({
                    id: item.id,
                    title: item.title,
                    parent_id: item.parent_id
                });
                if (item.children && item.children.length > 0) {
                    result = result.concat(flattenPrecinctList(item.children));
                }
            });
            return result;
        };

        const allPrecincts = flattenPrecinctList(PrecinctList);
        // console.log('Flattened Precincts:', allPrecincts);

        const filteredPrecincts = allPrecincts.filter(Precinct => {
            if (modalMode !== "edit") return true;
            if (Precinct.id === modalData?.id) return false;

            const isChildOfCurrent = (items, parentId) => {
                return items.some(item => {
                    if (item.id === parentId) return true;
                    if (item.children && item.children.length > 0) {
                        return isChildOfCurrent(item.children, parentId);
                    }
                    return false;
                });
            };

            return !isChildOfCurrent(PrecinctList, modalData?.id);
        });

        console.log('Filtered Precincts:', filteredPrecincts);

        return filteredPrecincts.map(Precinct => ({
            label: Precinct.title,
            value: Precinct.id
        }));
    };


    return (
        <>
            <Button
                className="modal-button"
                icon={<PlusOutlined className="text-center" />}
                onClick={() => setModal({ mode: "add", data: null })}
            >
                <span className="xs:hidden sm:hidden md:inline">افزودن حوزه</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} حوزه`}
                size={600}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
                loading={isCreating || isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={onFinishForm}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="title"
                                label="عنوان حوزه"
                                rules={[{ required: true, message: "لطفاً عنوان حوزه را وارد کنید" }]}
                            >
                                <Input placeholder="عنوان حوزه" />
                            </Form.Item>

                            <Form.Item name="parent_id" label="حوزه والد (اختیاری)">
                                <Select
                                    placeholder="انتخاب حوزه والد"
                                    loading={isFetchingPrecinct}
                                    allowClear
                                    options={getParentOptions()}
                                    value={form.getFieldValue('parent_id') || undefined}
                                />
                            </Form.Item>

                            <Form.Item name="life_cycle_id" label="چرخه زندگی">
                                <Select
                                    placeholder="انتخاب چرخه زندگی"
                                    options={LifeCycleList?.map(lifeCycle => ({
                                        label: lifeCycle.title,
                                        value: lifeCycle.id
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item name="is_definable" label="قابل تعریف" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default PrecinctModal;