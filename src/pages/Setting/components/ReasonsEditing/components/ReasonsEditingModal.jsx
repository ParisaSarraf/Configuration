import {Form, Input, message} from "antd";
import Modal from "../../../../../components/Modal";
import {useCreateReasonsEditing, useUpdateReasonsEditing} from "@/QueryServises/ReasonsEditingQuery/index.js";
import {useEffect} from "react";

const ReasonsEditingModal = (
    {
        isOpen,
        modalMode,
        closeModal,
        refetch,
        modalData
    }) => {
    const [form] = Form.useForm();
    const {mutateAsync: createReasonsEditing} = useCreateReasonsEditing()
    const {mutateAsync: updateReasonsEditing} = useUpdateReasonsEditing()


    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                name: modalData?.name
            })
        } else {
            form.resetFields()
        }
    }, [modalData, modalMode, form])

    const onFinish = async (values) => {
        try {
            if (modalMode === 'add') {
                await createReasonsEditing({name: values.name})
                message.success("دلیل با موفقیت اضافه شد.")
            } else {
                await updateReasonsEditing({ReasonsEditingId: modalData?.id, name: values.name})
                message.success("ویرایش با موفقیت انجام شد.")
            }
            refetch()
            closeModal()
        } catch (err) {
            message.error(err.message)
            console.error(err.message)
        }
    };
    return (
        <>
            <Modal
                isOpen={isOpen}
                title={`${
                    modalMode === "edit" ? "ویرایش" : "افزودن"
                } دلایل ویرایش نسخه`}
                size={400}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
            >
                <Form onFinish={onFinish} form={form} layout={"vertical"}>
                    <Form.Item name="name" label={"نام"}>
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ReasonsEditingModal;
