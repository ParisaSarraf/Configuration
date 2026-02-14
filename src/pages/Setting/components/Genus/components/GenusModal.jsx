import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import {
  useCreateGenusProduct,
  useUpdateGenusProduct,
  useGenusProductList,
} from "../../../../../QueryServises/genusQuery";
import TS from "@/components/TreeSelect/index.jsx";

const GenusModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  setModal,
  refetch,
}) => {
  const [form] = Form.useForm();
  const { data: genusList, isFetching: isFetchingGenus } =
    useGenusProductList();
  const { isPending: isCreating, mutateAsync: createGenus } =
    useCreateGenusProduct();
  const { isPending: isUpdating, mutateAsync: updateGenus } =
    useUpdateGenusProduct();
  console.log(modalData);

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        name: modalData.name,
        parent_id: modalData.parentId || undefined,
        material: modalData.material,
        difficulty: modalData.difficulty,
        equal_material: modalData.equal_material,
        internal_code: modalData.internal_code,
        order: modalData.order,
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = (values) => {
    console.log(values.parent_id);

    const payload = {
      name: values.name,
      material: values.material,
      difficulty: values.difficulty,
      equal_material: values.equal_material,
      order: values.order,
      internal_code: values.internal_code,
      ...(values.parent_id !== undefined && {
        parent_id: Number(values.parent_id),
      }),
    };

    if (modalMode === "add") {
      createGenus(payload)
        .then(() => {
          message.success("ماده اولیه با موفقیت اضافه شد");
          closeModal();
          refetch();
        })
        .catch((error) => {
          message.error(
            error.response?.data?.message ||
              "موفقیت آمیز نبود، دوباره امتحان کنید"
          );
          console.error(error);
        });
    } else if (modalMode === "edit") {
      if (!modalData?.id) {
        message.error("شناسه ماده اولیه معتبر نیست");
        return;
      }

      updateGenus({
        genusId: modalData.id,
        ...payload,
      })
        .then(() => {
          message.success("ماده اولیه با موفقیت ویرایش شد");
          closeModal();
          refetch();
        })
        .catch((error) => {
          message.error(
            error.response?.data?.message ||
              "موفقیت آمیز نبود، دوباره امتحان کنید"
          );
          console.error(error);
        });
    }
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
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} ماده اولیه`}
        size={600}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating || isFetchingGenus}
      >
        <Form form={form} layout="vertical" onFinish={onFinishForm}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="نام ماده اولیه"
                rules={[
                  { required: true, message: "لطفاً نام ماده اولیه را وارد کنید" },
                ]}
              >
                <Input placeholder="نام ماده اولیه" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="order"
                label="اولویت نمایش"
                rules={[
                  { required: true, message: "لطفاً اولویت نمایش را وارد کنید" },
                ]}
              >
                <Input placeholder="اولویت نمایش" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="parent_id" label="ماده اولیه والد (اختیاری)">
                <TS data={genusList} placeholder="ماده اولیه والد (اختیاری)" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="material" label="متریال">
                <Input placeholder="متریال" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="difficulty" label="درجه سختی">
                <Input placeholder="درجه سختی" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="equal_material" label="متریال معادل">
                <Input placeholder="متریال معادل" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="internal_code" label="کد داخلی">
                <Input placeholder="کد داخلی" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default GenusModal;
