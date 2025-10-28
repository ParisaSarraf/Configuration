import {Col, Form, Input, message, Row, Select} from "antd"
import Modal from "../../../../components/Modal"
import {
    useCreateProductSerial,
    useProductSerialById,
    useUpdateProductSerial
} from "@/QueryServises/productSerialQuery/index.js"
import {useEffect} from "react"
import {georgianDateToJalaliDate, jalaliDateToGeorgianDate} from "@utils/timeTool.jsx";
import Date from "@/components/DatePicker/Date.jsx";

const SerialListModal = ({isOpen, modalMode, modalData, closeModal, setModal, currentProduct, refetch}) => {
    const {isPending: isCreating, mutateAsync: createProductSerial} = useCreateProductSerial()
    const {isPending: isUpdating, mutateAsync: updateProductSerial} = useUpdateProductSerial()
    const parentCode = currentProduct?.productData?.parent_code
    const {data: productSerial} = useProductSerialById(parentCode)
    const [form] = Form.useForm()
    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                serial: modalData?.serial,
                product_id: modalData?.product_id,
                parent_id: modalData?.parent_id,
                date: georgianDateToJalaliDate(modalData?.date),
            })
        } else {
            form.resetFields()
        }
    }, [modalMode, modalData, form])

    const onFinish = async (values) => {
        const payload = {
            product_id: currentProduct?.id,
            parent_id: values.parent_id || null,
            serial: values.serial,
            date: jalaliDateToGeorgianDate(values?.date),
        }

        try {
            if (modalMode === 'add') {
                await createProductSerial(payload)
                message.success("سریال با موفقیت ایجاد شد")
                refetch()
            } else {
                await updateProductSerial({
                    ProductSerialId: modalData?.id,
                    ...payload
                })
                message.success("سریال با موفقیت ویرایش شد")
                refetch()
            }
            refetch()
            closeModal()
        } catch (error) {
            message.error("خطا در عملیات")
            console.error(error)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سریال`}
            size={600}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
            loading={isCreating || isUpdating}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="serial"
                            label="سریال"
                            rules={[{
                                required: true,
                                message: "لطفا سریال را وارد کنید"
                            }]}
                        >
                            <Input placeholder="سریال"/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="parent_id"
                            label="سریال های شاخه والد"
                        >
                            <Select
                                options={productSerial?.serials?.map(item => ({
                                    label: item.serial,
                                    value: item.id
                                })) || []}
                                placeholder="سریال های شاخه والد"
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>

                        <Date name="date"
                              label="تاریخ سریال"
                              stringifyDate
                              isRequired
                        />
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default SerialListModal