import React, { useEffect } from 'react'
import Modal from '../../../../../components/Modal'
import { Button, Form, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useCreateContractorProduct, useUpdateContractorProduct } from '../../../../../QueryServises/ProductContractorQuery'

const ContractorModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct, refetch }) => {
    const { mutateAsync: createContractor } = useCreateContractorProduct()
    const { mutateAsync: updateContractor } = useUpdateContractorProduct()


    const [form] = Form.useForm()

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData.name,
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);


    const onFinish = async (values) => {
        const payload = {
            name: values.name
        }
        try {
            if (modalMode === 'add') {
                await createContractor(payload)
            } else {
                await updateContractor({ ContractorId: modalData?.id, ...payload })
            }
            message.success('با موفقیت اضافه شد')
            closeModal()
            refetch()
        } catch (error) {
            message.error("مشکلی در اضافه شدن پیش آمده است")
            console.error(error);
        }
    }

    return (
        <>
            <Button
                className="modal-button"
                icon={<PlusOutlined className="text-center" />}
                onClick={() => setModal({ mode: "add", data: null })}
            >
                <span className="xs:hidden sm:hidden md:inline">افزودن پیمانکار/کارفرما</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} پیمانکار/کارفرما`}
                size={600}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
            >
                <Form onFinish={onFinish} form={form}>
                    <Form.Item name='name'>
                        <Input />
                    </Form.Item>
                </Form>

            </Modal>
        </>
    )
}

export default ContractorModal
