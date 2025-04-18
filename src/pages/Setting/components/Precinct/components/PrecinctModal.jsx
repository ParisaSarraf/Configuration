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
                parent_id: modalData.parent_id ?? undefined,
                is_definable: Boolean(modalData.is_definable),
                life_cycle_id: modalData.life_cycle?.id ?? modalData.life_cycle_id ?? undefined
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = (values) => {

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
                precinctId: modalData.id,
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
        if (!PrecinctList || PrecinctList.length === 0) return [];

        const flattenPrecinctList = (items, currentId = null) => {
            let result = [];
            items.forEach(item => {
                if (item.id !== currentId) {
                    result.push({
                        id: item.id,
                        title: item.title,
                        parent_id: item.parent_id
                    });

                    if (item.children && item.children.length > 0) {
                        result = result.concat(flattenPrecinctList(item.children, currentId));
                    }
                }
            });
            return result;
        };

        const currentId = modalMode === "edit" ? modalData?.id : null;
        const allPrecincts = flattenPrecinctList(PrecinctList, currentId);

        return allPrecincts.map(Precinct => ({
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
                />
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