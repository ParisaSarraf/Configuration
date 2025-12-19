import Modal from "@/components/Modal/index.jsx";
import {Col, Form, Input, message, Row} from "antd";
import {useCreateSystemEngineering, useUpdateSystemEngineering} from "@/QueryServises/SystemEngineering/index.js";
import {useEffect} from "react";
import {usePrecinctProductList} from "../../../QueryServises/precinctQuery";
import TS from "@/components/TreeSelect/index.jsx";

const SystemEngineerModal = ({isOpen, modalMode, closeModal, modalData, refetch}) => {
    const [form] = Form.useForm()
    const {mutateAsync: createSystem} = useCreateSystemEngineering()
    const {mutateAsync: updateSystem} = useUpdateSystemEngineering()
    const {data: precinctData} = usePrecinctProductList()


    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            const precinctId = modalData?.precinct?.id;
            const initialPrecinctId = precinctId ? [precinctId] : null;
            form.setFieldsValue({
                precinct_id: initialPrecinctId,
                title: modalData?.title,
                description: modalData?.description
            })
        } else {
            form.resetFields()
        }
    }, [form, modalData, modalMode])


   const onFinish = async (values) => {
  const precinctIdValue = values.precinct_id
    ? values.precinct_id.value 
    : null;

  const payload = {
    precinct_id: precinctIdValue,
    title: values.title,
    description: values.description,
  };

  try {
    if (modalMode === 'add') {
      await createSystem(payload);
      message.success('تعریف جدید اضافه شد.');
    } else {
      await updateSystem({ SystemEngineerId: modalData?.id, ...payload });
      message.success('با موفقیت ویرایش شد.');
    }
    refetch();
    closeModal();
  } catch (error) {
    message.error('مشکلی پیش آمده است.');
    console.error(error);
  }
};


    return (
        <Modal
            isOpen={isOpen}
            modalMode={modalMode}
            closeModal={closeModal}
            onClose={closeModal}
            title={`${modalMode === 'edit' ? "ویرایش" : "افزودن"} تعریف سیستم`}
            size={600}
            onSubmit={() => form.submit()}
        >
            <Form form={form} onFinish={onFinish} layout={'vertical'}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Form.Item name={'precinct_id'} label={"حوزه"}>
                            <TS data={precinctData} allowClear={true} labelInValue={true}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={'شرح تعریف'} name={'title'}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label={"توضیح"} name={'description'}>
                            <Input.TextArea/>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </Modal>
    );
}

export default SystemEngineerModal;